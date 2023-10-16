package fs

import (
	"context"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type FS struct {
	ctx context.Context
}

func NewFS() *FS {
	return &FS{}
}

func (fs *FS) Startup(ctx context.Context) {
	fs.ctx = ctx
}

func (fs *FS) GetPathSeperator() string {
	return string(os.PathSeparator)
}

func (fs *FS) DoesPathExist(fullPath string) bool {
	_, err := os.Stat(fullPath)
	return !os.IsNotExist(err)
}

func (fs *FS) CreateDir(path string) string {
	err := os.MkdirAll(path, 0755)
	if err != nil {
		message := fmt.Sprintf("CreateDir: Error creating dir \"%s\"\n%s", path, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return message
	}
	return ""
}

type ReadDirResult struct {
	DirEntries []os.DirEntry `json:"dirEntries"`
	Error      string        `json:"error"`
}

func (fs *FS) ReadDir(path string) ReadDirResult {
	dirEntries, err := os.ReadDir(path)
	if err != nil {
		message := fmt.Sprintf("ReadDir: Error reading dir \"%s\"\n%s", path, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return ReadDirResult{Error: message}
	}
	return ReadDirResult{DirEntries: dirEntries}
}

type ReadTextFileResult struct {
	Data  string `json:"data"`
	Error string `json:"error"`
}

func (fs *FS) ReadTextFile(path string) ReadTextFileResult {
	data, err := os.ReadFile(path)
	if err != nil {
		message := fmt.Sprintf("ReadTextFile: Error reading file \"%s\"\n%s", path, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return ReadTextFileResult{Error: message}
	}
	return ReadTextFileResult{Data: string(data)}
}

func (fs *FS) RemoveDir(path string) string {
	err := os.RemoveAll(path)
	if err != nil {
		message := fmt.Sprintf("RemoveDir: Error removing dir \"%s\"\n%s", path, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return message
	}
	return ""
}

func (fs *FS) RemoveFile(path string) string {
	err := os.Remove(path)
	if err != nil {
		message := fmt.Sprintf("RemoveFile: Error removing file \"%s\"\n%s", path, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return message
	}
	return ""
}

func (fs *FS) Rename(oldPath, newPath string) string {
	err := os.Rename(oldPath, newPath)
	if err != nil {
		message := fmt.Sprintf("Rename: Error renaming \"%s\" to \"%s\"\n%s", oldPath, newPath, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return message
	}
	return ""
}

func (fs *FS) WriteFile(path string, data string) string {
	err := os.WriteFile(path, []byte(data), 0644)
	if err != nil {
		message := fmt.Sprintf("WriteFile: Error writing file \"%s\"\n%s", path, err.Error())
		runtime.LogErrorf(fs.ctx, message)
		return message
	}
	return ""
}
