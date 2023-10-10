package search

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
)

type Search struct {
	ctx context.Context
}

func NewSearch() *Search {
	return &Search{}
}

func (s *Search) Startup(ctx context.Context) {
	s.ctx = ctx
}

type SearchResult struct {
	Id      int32  `json:"id"`
	Name    string `json:"name"`
	RowType string `json:"type"`
	Path    string `json:"path"`
}

// Type
// Satisfy the `bleve.Classifier` interface, so bleve classifies this struct as the `DocSet` document type
func (d *SearchResult) Type() string {
	return "DocSet"
}

func (d *SearchResult) Index(index *bleve.Batch) error {
	err := index.Index(string(d.Id), d)
	return err
}

func (s *Search) CreateDocSetIndex(indexPath string, dbPath string) string {
	bleveIndexMapping := newBleveIndexMapping(s)
	bleveIndex, err := bleve.New(indexPath, bleveIndexMapping)
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error creating bleve index \"%s\"\n%s", indexPath, err.Error())
		runtime.LogErrorf(s.ctx, message)
		return message
	}
	defer bleveIndex.Close()

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error opening db \"%s\"\n%s", dbPath, err.Error())
		runtime.LogErrorf(s.ctx, message)
		return err.Error()
	}
	defer db.Close()

	stmt, err := db.Prepare("SELECT si.id, si.name, si.type, si.path FROM searchIndex si;")
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error preparing query for \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(s.ctx, message)
		return message
	}
	defer stmt.Close()

	rows, err := stmt.Query()
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error querying db \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(s.ctx, message)
		return message
	}
	defer rows.Close()

	bleveBatch := bleveIndex.NewBatch()
	for rows.Next() {
		var docSetRow = SearchResult{}
		err = rows.Scan(&docSetRow.Id, &docSetRow.Name, &docSetRow.RowType, &docSetRow.Path)
		if err != nil {
			message := fmt.Sprintf("CreateDocSetIndex: Error scanning db row \"%s\"\n%s", dbPath, err.Error())
			runtime.LogErrorf(s.ctx, message)
		}
		err = docSetRow.Index(bleveBatch)
		if err != nil {
			message := fmt.Sprintf("CreateDocSetIndex: Error batching bleve index for \"%s\"\n%s", dbPath, err.Error())
			runtime.LogErrorf(s.ctx, message)
		}
	}
	err = bleveIndex.Batch(bleveBatch)
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error executing bleve batch for \"%s\"\n%s", dbPath, err.Error())
		runtime.LogErrorf(s.ctx, message)
		return message
	}

	err = rows.Err()
	if err != nil {
		message := fmt.Sprintf("CreateDocSetIndex: Error iterating db row \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(s.ctx, message)
		return message
	}

	runtime.LogPrintf(s.ctx, "CreateDocSetIndex: complete.")

	return ""
}

type SearchDocSetResult struct {
	Results []SearchResult `json:"results"`
	Error   string         `json:"error"`
}

func (s *Search) SearchDocSet(indexPath string, term string) SearchDocSetResult {
	bleveIndex, err := bleve.Open(indexPath)
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error opening bleve index \"%s\"\n%s", indexPath, err)
		runtime.LogErrorf(s.ctx, message)
		return SearchDocSetResult{Error: message}
	}
	defer bleveIndex.Close()

	//splitTerms := strings.Split(term, " ")
	//var matchQueries []*query.MatchQuery
	//for _, splitTerm := range splitTerms {
	//	matchQuery := bleve.NewMatchQuery(splitTerm)
	//	matchQueries = append(matchQueries, matchQuery)
	//}
	//var queries = make([]query.Query, len(matchQueries))
	//for i, matchQuery := range matchQueries {
	//	queries[i] = query.Query(matchQuery)
	//}

	matchQuery := bleve.NewMatchQuery(term)
	searchRequest := bleve.NewSearchRequest(matchQuery)
	searchRequest.Fields = []string{"id", "name", "type", "path"}
	searchRequest.IncludeLocations = true
	searchResult, err := bleveIndex.Search(searchRequest)
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error searching bleve index \"%s\"\n%s", indexPath, err)
		runtime.LogErrorf(s.ctx, message)
		return SearchDocSetResult{Error: message}
	}

	var results []SearchResult
	if searchResult.Total > 0 {
		runtime.LogPrintf(s.ctx, "\n")
		for _, hit := range searchResult.Hits {
			docSetRow := SearchResult{
				Id:      int32(hit.Fields["id"].(float64)),
				Name:    hit.Fields["name"].(string),
				RowType: hit.Fields["type"].(string),
				Path:    hit.Fields["path"].(string),
			}
			results = append(results, docSetRow)

			for _, outerValue := range hit.Locations {
				for _, innerValue := range outerValue {
					for _, location := range innerValue {
						runtime.LogPrintf(s.ctx, "SearchDocSet: Result - %+v", location)
					}
				}
			}
			message := fmt.Sprintf("SearchDocSet: Result - Score: %+v, Locations: %+v", hit.Score, hit.Locations["name"]["map"])
			runtime.LogPrintf(s.ctx, message)
		}
		//message := fmt.Sprintf("SearchDocSet: Result - %v", results)
		//runtime.LogPrintf(s.ctx, message)
	}

	return SearchDocSetResult{Results: results}
}

func newBleveIndexMapping(s *Search) *mapping.IndexMappingImpl {
	bleveIndexMapping := bleve.NewIndexMapping()
	err := bleveIndexMapping.AddCustomCharFilter("regexp", map[string]interface{}{
		"type":    regexp.Name,
		"regexp":  "[.]",
		"replace": " ",
	})
	if err != nil {
		message := fmt.Sprintf("newBleveIndexMapping: Error adding custom char filter\n%s", err)
		runtime.LogErrorf(s.ctx, message)
	}

	err = bleveIndexMapping.AddCustomAnalyzer("custom", map[string]interface{}{
		"type": custom.Name,
		"char_filters": []string{
			"regexp",
		},
		"tokenizer": whitespace.Name,
		"token_filters": []string{
			lowercase.Name,
		},
	})
	if err != nil {
		message := fmt.Sprintf("newBleveIndexMapping: Error adding custom analyzer\n%s", err)
		runtime.LogErrorf(s.ctx, message)
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
