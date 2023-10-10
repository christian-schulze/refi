package main

import (
	"context"
	"embed"
	"fmt"
	"net/http"
	"os"
	"refi/backend/config"
	"refi/backend/db"
	"refi/backend/docsets"
	"refi/backend/fs"
	"refi/backend/search"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

type FileLoader struct {
	http.Handler
}

func NewFileLoader() *FileLoader {
	return &FileLoader{}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	requestedFilename := req.URL.Path
	fmt.Printf("***** [ Serving %s\n", requestedFilename)
	fileData, err := os.ReadFile(requestedFilename)
	if err != nil {
		res.WriteHeader(http.StatusBadRequest)
		res.Write([]byte(fmt.Sprintf("Could not load file %s", requestedFilename)))
	}

	res.Write(fileData)
}

func main() {
	// Create an instance of the app structure
	app := NewApp()
	beConfig := config.NewConfig()
	beDB := db.NewDB()
	beDocSets := docsets.NewDocSets()
	beFS := fs.NewFS()
	beSearch := search.NewSearch()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "refi",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: NewFileLoader(),
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			beConfig.Startup(ctx)
			beDB.Startup(ctx)
			beDocSets.Startup(ctx)
			beFS.Startup(ctx)
			beSearch.Startup(ctx)
		},
		Bind: []interface{}{
			app,
			beConfig,
			beDB,
			beDocSets,
			beFS,
			beSearch,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
