package main

import (
	"context"
	"fyne.io/systray"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"refi/icon"
)

type App struct {
	ctx        context.Context
	SysTrayEnd func()
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// TODO: using 3rd party systray library https://github.com/fyne-io/systray / https://pkg.go.dev/fyne.io/systray
	// wails v3 will have built-in systray support
	sysTrayStart, sysTrayEnd := systray.RunWithExternalLoop(a.sysTrayOnReady, a.sysTrayOnExit)
	a.SysTrayEnd = sysTrayEnd
	sysTrayStart()
}

func (a *App) GetUserDataDir() string {
	dataDir := os.Getenv("XDG_DATA_HOME")
	if dataDir == "" {
		dataDir = os.ExpandEnv("$HOME/.local/share")
	}
	return dataDir
}

func (a *App) GetUserConfigDir() string {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = os.ExpandEnv("$HOME/.config")
	}
	return configDir
}

func (a *App) GetAppName() string {
	return "refi"
}

func (a *App) sysTrayOnReady() {
	systray.SetIcon(icon.Data)
	systray.SetTitle("Refi - offline documentation viewer")
	systray.SetTooltip("Refi - offline documentation viewer")

	mOpenApp := systray.AddMenuItem("Open", "Open Refi")
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Quit", "Quit Refi")

	go func() {
		for {
			select {
			case <-mOpenApp.ClickedCh:
				runtime.WindowShow(a.ctx)
			case <-mQuit.ClickedCh:
				systray.Quit()
				a.SysTrayEnd()
			}
		}
	}()
}

func (a *App) sysTrayOnExit() {
	runtime.Quit(a.ctx)
}
