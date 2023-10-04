package docsets

import (
	"archive/tar"
	"archive/zip"
	"bufio"
	"compress/gzip"
	"context"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type DocSets struct {
	ctx context.Context
}

func NewDocSets() *DocSets {
	return &DocSets{}
}

func (a *DocSets) Startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *DocSets) DownloadFeedArchive(eventId string, url string, filePath string) string {
	err := a.downloadFile(eventId, url, filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "DownloadFeedArchive: Error downloading feed \"%s\"\n%s", url, err)
		return err.Error()
	}
	return ""
}

type DocSetFeed map[string]string

func (a *DocSets) ReadFeedArchive(filePath string) DocSetFeed {
	r, err := zip.OpenReader(filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "ReadFeedArchive: Error reading feed \"%s\"\n%s", filePath, err)
	}
	defer r.Close()

	var docSetFeed = DocSetFeed{}
	for _, file := range r.File {
		if strings.HasSuffix(file.Name, ".xml") {
			rc, err := file.Open()
			if err != nil {
				runtime.LogErrorf(a.ctx, "ReadFeedArchive: Error opening file within archive \"%s\"\n%s", file.Name, err)
			}
			fileContents, err := io.ReadAll(rc)
			if err != nil {
				runtime.LogErrorf(a.ctx, "ReadFeedArchive: Error reading file within archive \"%s\"\n%s", file.Name, err)
			}
			var sanitizedKey = strings.Replace(file.Name, "feeds-master/", "", 1)
			sanitizedKey = strings.Replace(sanitizedKey, ".xml", "", 1)
			sanitizedKey = strings.ReplaceAll(sanitizedKey, "_", " ")
			docSetFeed[sanitizedKey] = string(fileContents)
		}
	}

	return docSetFeed
}

func (a *DocSets) DownloadFile(eventId string, url string, filePath string) string {
	err := a.downloadFile(eventId, url, filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "DownloadFile: Error downloading file \"%s\"\n%s", url, err)
		return err.Error()
	}
	return ""
}

func (a *DocSets) DecompressDocSetArchive(tarFilePath string, dirPath string) string {
	f, err := os.OpenFile(tarFilePath, os.O_RDONLY, 0644)
	if err != nil {
		runtime.LogErrorf(a.ctx, "UntarDocSet: Error opening tar file \"%s\"\n%s", tarFilePath, err)
		return err.Error()
	}

	r := bufio.NewReader(f)
	gzipReader, err := gzip.NewReader(r)
	if err != nil {
		runtime.LogErrorf(a.ctx, "UntarDocSet: Error creating gzip reader \"%s\"\n%s", tarFilePath, err)
		return err.Error()
	}

	err = untar(gzipReader, dirPath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "UntarDocSet: Error extracting tar file \"%s\"\n%s", tarFilePath, err)
		return err.Error()
	}

	return ""
}

func (a *DocSets) GetDownloadedDocSetPaths(docSetsPath string) []string {
	var downloadedDocSets []string

	dirEntries, err := os.ReadDir(docSetsPath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "GetDownloadedDocSetPaths: Error reading dir \"%s\"\n%s", docSetsPath, err.Error())
		return downloadedDocSets
	}

	for _, dirEntry := range dirEntries {
		if strings.HasSuffix(dirEntry.Name(), ".docset") {
			downloadedDocSets = append(downloadedDocSets, path.Join(docSetsPath, dirEntry.Name()))
		}
	}

	return downloadedDocSets
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

func (a *DocSets) downloadFile(eventId string, url string, filepath string) error {
	out, err := os.Create(filepath + ".tmp")
	if err != nil {
		return err
	}

	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Create our bytes counter and pass it to be used alongside our writer
	counter := &WriteCounter{ctx: a.ctx, Id: eventId, Total: uint64(resp.ContentLength)}
	_, err = io.Copy(out, io.TeeReader(resp.Body, counter))
	if err != nil {
		return err
	}

	out.Close()

	err = os.Rename(filepath+".tmp", filepath)
	if err != nil {
		return err
	}

	return nil
}

type WriteCounter struct {
	ctx      context.Context
	Id       string
	Progress uint64
	Total    uint64
}

type DownloadFileEvent struct {
	Id       string `json:"id"`
	Progress uint64 `json:"progress"`
	Total    uint64 `json:"total"`
}

func (wc *WriteCounter) Write(p []byte) (int, error) {
	chunkLength := len(p)
	wc.Progress += uint64(chunkLength)
	runtime.EventsEmit(wc.ctx, "file_downloader|progress", DownloadFileEvent{Id: wc.Id, Progress: wc.Progress, Total: wc.Total})
	return chunkLength, nil
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

func untar(reader io.Reader, dst string) error {
	tr := tar.NewReader(reader)

	for {
		header, err := tr.Next()
		switch {
		// no more files
		case err == io.EOF:
			return nil
		case err != nil:
			return err
		case header == nil:
			continue
		}

		target := filepath.Join(dst, header.Name)

		switch header.Typeflag {
		// create directory if doesn't exit
		case tar.TypeDir:
			if _, err := os.Stat(target); err != nil {
				if err := os.MkdirAll(target, 0755); err != nil {
					return err
				}
			}
		// create file
		case tar.TypeReg:
			f, err := os.OpenFile(target, os.O_CREATE|os.O_RDWR, os.FileMode(header.Mode))
			if err != nil {
				return err
			}
			defer f.Close()

			// copy contents to file
			if _, err := io.Copy(f, tr); err != nil {
				return err
			}
		}
	}
}
