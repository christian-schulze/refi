package db

import (
	"context"
	"database/sql"
	"encoding/xml"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	ctx         context.Context
	connections map[string]*sql.DB
}

func NewDB() *DB {
	// TODO: spellfix extension is currently compiled and located at `resources/spellfix.so`
	//   Need to figure out a way to distribute this lib with the app and load correctly
	//sql.Register(
	//	"sqlite3_with_spellfix_extension",
	//	&sqlite3.SQLiteDriver{
	//		Extensions: []string{
	//			"resources/spellfix",
	//		},
	//	})

	return &DB{connections: map[string]*sql.DB{}}
}

func (db *DB) Startup(ctx context.Context) {
	db.ctx = ctx
}

func (db *DB) OpenDB(dbPath string) string {
	dbConn, err := sql.Open("sqlite3", dbPath)
	//db, err := sql.Open("sqlite3_with_spellfix_extension", dbPath)
	if err != nil {
		runtime.LogErrorf(db.ctx, "OpenDB: Error opening db \"%s\"\n%s", dbPath, err)
		return err.Error()
	}

	db.connections[dbPath] = dbConn

	return ""
}

func (db *DB) Close(dbPath string) {
	dbConn := db.connections[dbPath]
	if dbConn == nil {
		runtime.LogErrorf(db.ctx, "Close: connection not found \"%s\"", dbPath)
		return
	}

	err := dbConn.Close()
	if err != nil {
		runtime.LogErrorf(db.ctx, "Close: Error closing db \"%s\"\n%s", dbPath, err)
	}

	delete(db.connections, dbPath)
}

func (db *DB) TableExists(dbPath string, table string) bool {
	dbConn := db.connections[dbPath]
	if dbConn == nil {
		runtime.LogErrorf(db.ctx, "TableExists: connection not found \"%s\"", dbPath)
		return false
	}

	rows, err := dbConn.Query("SELECT count(*) FROM sqlite_master WHERE type='table' AND name=?;", table)
	if err != nil {
		runtime.LogErrorf(db.ctx, "TableExists: Error querying db \"%s\"\n%s", dbPath, err)
		return false
	}
	defer rows.Close()

	rows.Next()

	var result = struct{ count int32 }{}
	err = rows.Scan(&result.count)
	if err != nil {
		runtime.LogErrorf(db.ctx, "TableExists: Error scanning db row \"%s\"\n%s", dbPath, err)
	}

	err = rows.Err()
	if err != nil {
		runtime.LogErrorf(db.ctx, "TableExists: Error iterating db row \"%s\"\n%s", dbPath, err)
	}

	return result.count == 1
}

type TokenIdentifier struct {
	Name        string `xml:"Name"`
	Type        string `xml:"Type"`
	APILanguage string `xml:"APILanguage"`
}

type Token struct {
	TokenIdentifier TokenIdentifier `xml:"TokenIdentifier"`
	Path            string          `xml:"Path"`
}

type Tokens struct {
	Tokens []Token `xml:"Token"`
}

func (db *DB) ImportSearchIndex(dbPath string, xmlFilePath string) string {
	data, err := os.ReadFile(xmlFilePath)
	if err != nil {
		message := fmt.Sprintf("ImportSearchIndex: Error reading file \"%s\"\n%s", xmlFilePath, err.Error())
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	var tokens Tokens
	err = xml.Unmarshal(data, &tokens)
	if err != nil {
		message := fmt.Sprintf("ImportSearchIndex: Error unmarshalling file \"%s\"\n%s", xmlFilePath, err.Error())
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	dbConn := db.connections[dbPath]
	if dbConn == nil {
		message := fmt.Sprintf("ImportSearchIndex: connection not found \"%s\"", dbPath)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	_, err = dbConn.Exec("CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);")
	if err != nil {
		message := fmt.Sprintf("ImportSearchIndex: error creating searchIndex table\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	_, err = dbConn.Exec("CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);")
	if err != nil {
		message := fmt.Sprintf("ImportSearchIndex: error creating searchIndex index\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	sqlInsert := "INSERT INTO searchIndex(id, name, type, path) VALUES "
	const rowSQL = "(?, ?, ?, ?)"
	var inserts []string
	vals := []interface{}{}
	for id, row := range tokens.Tokens {
		inserts = append(inserts, rowSQL)
		vals = append(vals, id, row.TokenIdentifier.Name, row.TokenIdentifier.Type, row.Path)
	}
	sqlInsert = sqlInsert + strings.Join(inserts, ",")

	_, err = dbConn.Exec(sqlInsert, vals...)
	if err != nil {
		message := fmt.Sprintf("ImportSearchIndex: error inserting records into searchIndex table\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	return ""
}

type DocSetRow struct {
	Id    int32  `json:"id"`
	Name  string `json:"name"`
	Type  string `json:"type"`
	Path  string `json:"path"`
	Score int    `json:"score"`
}

type DocSetRows []DocSetRow

func (d DocSetRows) Len() int {
	return len(d)
}

func (d DocSetRows) Swap(i, j int) {
	d[i], d[j] = d[j], d[i]
}
func (d DocSetRows) Less(i, j int) bool {
	return d[i].Name < d[j].Name
}
func (d DocSetRows) Keywords(i int) string {
	return d[i].Name
}

type SearchDocSetResult struct {
	Results DocSetRows `json:"results"`
	Error   string     `json:"error"`
}

func (db *DB) SearchDocSet(dbPath string, term string) SearchDocSetResult {
	var docSets = DocSetRows{}

	dbConn := db.connections[dbPath]
	if dbConn == nil {
		message := fmt.Sprintf("SearchDocSet: connection not found \"%s\"", dbPath)
		runtime.LogErrorf(db.ctx, message)
		return SearchDocSetResult{Results: nil, Error: message}
	}

	stmt, err := dbConn.Prepare("SELECT si.id, si.name, si.type, si.path FROM searchIndex si WHERE si.name LIKE ? LIMIT 100;")
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error preparing query for \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(db.ctx, message)
		return SearchDocSetResult{Results: nil, Error: message}
	}
	defer stmt.Close()

	rows, err := stmt.Query(term)
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error querying db \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(db.ctx, message)
		return SearchDocSetResult{Results: nil, Error: message}
	}
	defer rows.Close()

	for rows.Next() {
		var docSet = DocSetRow{}
		err = rows.Scan(&docSet.Id, &docSet.Name, &docSet.Type, &docSet.Path)
		if err != nil {
			runtime.LogErrorf(db.ctx, "SearchDocSet: Error scanning db row \"%s\"\n%s", dbPath, err)
		}
		docSets = append(docSets, docSet)
	}

	err = rows.Err()
	if err != nil {
		message := fmt.Sprintf("SearchDocSet: Error iterating db row \"%s\"\n%s", dbPath, err)
		runtime.LogErrorf(db.ctx, message)
		return SearchDocSetResult{Results: nil, Error: message}
	}

	// fuzzy search filtering/ordering
	//sorter := fuzzy.New(docSets)
	//sorter.Configure(fuzzy.UnmatchedLetterPenalty(0))
	//results := sorter.Sort(term)

	//for _, result := range results {
	//	runtime.LogPrintf(a.ctx, "%+v", result)
	//}

	return SearchDocSetResult{Results: docSets, Error: ""}
}

func (db *DB) CreateFuzzySearchIndex(dbPath string) string {
	dbConn := db.connections[dbPath]
	if dbConn == nil {
		message := fmt.Sprintf("CreateFuzzySearchIndex: connection not found \"%s\"", dbPath)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	_, err := dbConn.Exec("CREATE VIRTUAL TABLE fuzzySearchIndex USING spellfix1();")
	if err != nil {
		message := fmt.Sprintf("CreateFuzzySearchIndex: error creating fuzzySearchIndex table\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	_, err = dbConn.Exec("INSERT INTO fuzzySearchIndex(word) SELECT si.name FROM searchIndex si;")
	if err != nil {
		message := fmt.Sprintf("CreateFuzzySearchIndex: error populating fuzzySearchIndex table\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	_, err = dbConn.Exec("ALTER TABLE searchIndex ADD fuzzySearchIndexId INTEGER REFERENCES fuzzySearchIndex (rowid);")
	if err != nil {
		message := fmt.Sprintf("CreateFuzzySearchIndex: error altering searchIndex table\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	_, err = dbConn.Exec("UPDATE searchIndex SET fuzzySearchIndexId = fsi.rowid FROM fuzzySearchIndex fsi WHERE name = fsi.word;")
	if err != nil {
		message := fmt.Sprintf("CreateFuzzySearchIndex: error populating searchIndex table with foreign keys\n%s", err)
		runtime.LogErrorf(db.ctx, message)
		return message
	}

	return ""
}
