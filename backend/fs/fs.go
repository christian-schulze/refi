package fs

import (
	"context"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type FS struct {
	ctx context.Context
}

func NewFS() *FS {
	return &FS{}
}

func (a *FS) Startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *FS) GetPathSeperator() string {
	return string(os.PathSeparator)
}

func (a *FS) DoesPathExist(fullPath string) bool {
	_, err := os.Stat(fullPath)
	return !os.IsNotExist(err)
}

func (a *FS) CreateDir(fullPath string) {
	os.MkdirAll(fullPath, 0755)
}

func (a *FS) RemoveDir(path string) {
	err := os.RemoveAll(path)
	if err != nil {
		runtime.LogErrorf(a.ctx, "RemoveDir: Error removing dir \"%s\"\n%s", path, err.Error())
	}
}

func (a *FS) ReadDir(path string) []os.DirEntry {
	dirEntries, err := os.ReadDir(path)
	if err != nil {
		runtime.LogErrorf(a.ctx, "ReadDir: Error reading dir \"%s\"\n%s", path, err.Error())
	}
	return dirEntries
}

func (a *FS) ReadTextFile(filePath string) string {
	data, err := os.ReadFile(filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "ReadTextFile: Error reading file \"%s\"\n%s", filePath, err.Error())
		data = []byte{}
	}
	return string(data)
}

func (a *FS) WriteFile(filePath string, data string) {
	err := os.WriteFile(filePath, []byte(data), 0644)
	if err != nil {
		runtime.LogErrorf(a.ctx, "WriteFile: Error writing file \"%s\"\n%s", filePath, err.Error())
	}
}

func (a *FS) RemoveFile(filePath string) {
	err := os.Remove(filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "RemoveFile: Error removing file \"%s\"\n%s", filePath, err.Error())
	}
}
