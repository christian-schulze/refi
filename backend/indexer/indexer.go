package indexer

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/custom"
	"github.com/blevesearch/bleve/v2/analysis/char/regexp"
	"github.com/blevesearch/bleve/v2/analysis/token/lowercase"
	"github.com/blevesearch/bleve/v2/analysis/tokenizer/whitespace"
	"github.com/blevesearch/bleve/v2/mapping"
	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"strings"
)

type Indexer struct {
	ctx         context.Context
	connections map[string]bleve.Index
}

func NewIndexer() *Indexer {
	return &Indexer{connections: map[string]bleve.Index{}}
}

func (i *Indexer) Startup(ctx context.Context) {
	i.ctx = ctx
}

func (i *Indexer) CloseIndex(indexPath string) string {
	index := i.connections[indexPath]
	if index == nil {
		runtime.LogPrintf(i.ctx, fmt.Sprintf("Close: connection not found \"%s\"", indexPath))
		return ""
	}

	err := index.Close()
	if err != nil {
		message := fmt.Sprintf("Close: Error closing index \"%s\"\n%s", indexPath, err.Error())
		runtime.LogErrorf(i.ctx, message)
		return message
	}

	delete(i.connections, indexPath)
	return ""
}

type IndexedItem struct {
	Id      int32  `json:"id"`
	Name    string `json:"name"`
	RowType string `json:"type"`
	Path    string `json:"path"`
}

// Type
// Satisfy the `bleve.Classifier` interface, so bleve classifies this struct as the `DocSet` document type
func (i *IndexedItem) Type() string {
	return "DocSet"
}

func (i *IndexedItem) Index(index *bleve.Batch) error {
	err := index.Index(string(i.Id), i)
	return err
}

func (i *Indexer) CreateDocSetIndex(indexPath string, dbPath string) string {
	bleveIndexMapping := i.newBleveIndexMapping()
	bleveIndex, err := bleve.New(indexPath, bleveIndexMapping)
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error creating bleve index \"%s\"\n%s", indexPath, err.Error())
		runtime.LogErrorf(i.ctx, message)
		return message
	}
	defer bleveIndex.Close()

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error opening db \"%s\"\n%s", dbPath, err.Error())
		runtime.LogErrorf(i.ctx, message)
		return err.Error()
	}
	defer db.Close()

	stmt, err := db.Prepare("SELECT si.id, si.name, si.type, si.path FROM searchIndex si;")
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error preparing query for \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(i.ctx, message)
		return message
	}
	defer stmt.Close()

	rows, err := stmt.Query()
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error querying db \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(i.ctx, message)
		return message
	}
	defer rows.Close()

	bleveBatch := bleveIndex.NewBatch()
	for rows.Next() {
		var docSetRow = IndexedItem{}
		err = rows.Scan(&docSetRow.Id, &docSetRow.Name, &docSetRow.RowType, &docSetRow.Path)
		if err != nil {
			message := fmt.Sprintf("CreateDocSetIndex: Error scanning db row \"%s\"\n%s", dbPath, err.Error())
			runtime.LogErrorf(i.ctx, message)
		}
		err = docSetRow.Index(bleveBatch)
		if err != nil {
			message := fmt.Sprintf("CreateDocSetIndex: Error batching bleve index for \"%s\"\n%s", dbPath, err.Error())
			runtime.LogErrorf(i.ctx, message)
		}
	}
	err = bleveIndex.Batch(bleveBatch)
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error executing bleve batch for \"%s\"\n%s", dbPath, err.Error())
		runtime.LogErrorf(i.ctx, message)
		return message
	}

	err = rows.Err()
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error iterating db row \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(i.ctx, message)
		return message
	}

	runtime.LogPrintf(i.ctx, "CreateDocSetIndex: complete.")

	return ""
}

type SearchDocSetResult struct {
	Results []IndexedItem `json:"results"`
	Error   string        `json:"error"`
}

func (i *Indexer) SearchDocSet(indexPath string, term string) SearchDocSetResult {
	bleveIndex, err := i.findOrOpenIndex(indexPath)
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error opening bleve index \"%s\"\n%s", indexPath, err)
		runtime.LogErrorf(i.ctx, message)
		return SearchDocSetResult{Error: message}
	}

	matchQuery := bleve.NewMatchQuery(term)

	splitTerms := strings.Split(term, " ")
	updatedTerm := strings.Join(splitTerms, ".*")
	updatedTerm = fmt.Sprintf(".{0}%s.*", updatedTerm)
	reqexpQuery := bleve.NewRegexpQuery(updatedTerm)

	disjunctionQuery := bleve.NewDisjunctionQuery(matchQuery, reqexpQuery)

	searchRequest := bleve.NewSearchRequest(disjunctionQuery)

	searchRequest.Fields = []string{"id", "name", "type", "path"}
	searchRequest.IncludeLocations = true
	searchResult, err := bleveIndex.Search(searchRequest)
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error searching bleve index \"%s\"\n%s", indexPath, err)
		runtime.LogErrorf(i.ctx, message)
		return SearchDocSetResult{Error: message}
	}

	var results []IndexedItem
	if searchResult.Total > 0 {
		runtime.LogPrintf(i.ctx, "\n")
		for _, hit := range searchResult.Hits {
			docSetRow := IndexedItem{
				Id:      int32(hit.Fields["id"].(float64)),
				Name:    hit.Fields["name"].(string),
				RowType: hit.Fields["type"].(string),
				Path:    hit.Fields["path"].(string),
			}
			results = append(results, docSetRow)

			for _, outerValue := range hit.Locations {
				for key, innerValue := range outerValue {
					runtime.LogPrintf(i.ctx, "Term: %+v", key)
					for _, location := range innerValue {
						runtime.LogPrintf(i.ctx, "  %+v", location)
					}
				}
			}
			message := fmt.Sprintf("Score: %+v", hit.Score)
			runtime.LogPrintf(i.ctx, message)
		}
		//message := fmt.Sprintf("SearchDocSet: Result - %v", results)
		//runtime.LogPrintf(s.ctx, message)
	}

	return SearchDocSetResult{Results: results}
}

func (i *Indexer) findOrOpenIndex(indexPath string) (bleve.Index, error) {
	bleveIndex, ok := i.connections[indexPath]
	if !ok {
		bleveIndex, err := bleve.Open(indexPath)
		if err != nil {
			return nil, err
		}
		i.connections[indexPath] = bleveIndex
		return bleveIndex, nil
	}
	return bleveIndex, nil
}

func (i *Indexer) newBleveIndexMapping() *mapping.IndexMappingImpl {
	bleveIndexMapping := bleve.NewIndexMapping()
	err := bleveIndexMapping.AddCustomCharFilter("regexp", map[string]interface{}{
		"type":    regexp.Name,
		"regexp":  "[.]",
		"replace": " ",
	})
	if err != nil {
		message := fmt.Sprintf("newBleveIndexMapping: Error adding custom char filter\n%s", err)
		runtime.LogErrorf(i.ctx, message)
	}

	err = bleveIndexMapping.AddCustomAnalyzer("custom", map[string]interface{}{
		"type":         custom.Name,
		"char_filters": []string{
			//"regexp",
		},
		"tokenizer": whitespace.Name,
		"token_filters": []string{
			lowercase.Name,
		},
	})
	if err != nil {
		message := fmt.Sprintf("newBleveIndexMapping: Error adding custom analyzer\n%s", err)
		runtime.LogErrorf(i.ctx, message)
	}

	docSetDocumentMapping := bleve.NewDocumentMapping()
	bleveIndexMapping.AddDocumentMapping("DocSet", docSetDocumentMapping)

	idFieldMapping := bleve.NewTextFieldMapping()
	idFieldMapping.Index = false
	docSetDocumentMapping.AddFieldMappingsAt("Id", idFieldMapping)

	nameFieldMapping := bleve.NewTextFieldMapping()
	nameFieldMapping.Analyzer = "custom"
	nameFieldMapping.IncludeTermVectors = true
	docSetDocumentMapping.AddFieldMappingsAt("name", nameFieldMapping)

	typeFieldMapping := bleve.NewTextFieldMapping()
	typeFieldMapping.Index = false
	docSetDocumentMapping.AddFieldMappingsAt("type", typeFieldMapping)

	pathFieldMapping := bleve.NewTextFieldMapping()
	pathFieldMapping.Index = false
	docSetDocumentMapping.AddFieldMappingsAt("path", pathFieldMapping)

	return bleveIndexMapping
}
