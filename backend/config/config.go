package config

import (
	"bytes"
	"context"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Config struct {
	ctx context.Context
}

func NewConfig() *Config {
	return &Config{}
}

func (a *Config) Startup(ctx context.Context) {
	a.ctx = ctx
}

type ConfigObject struct {
	DocSetsFeedUrl  string `json:"docSetsFeedUrl"`
	DocSetsIconsUrl string `json:"docSetsIconsUrl"`
	DocSetsPath     string `json:"docSetsPath"`
}

func (a *Config) LoadSettings(filePath string) ConfigObject {
	var decoded ConfigObject
	_, err := toml.DecodeFile(filePath, &decoded)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error reading file \"%s\"\n%s", filePath, err.Error())
	}

	return decoded
}

func (a *Config) WriteSettings(filePath string, config ConfigObject) {
	buffer := new(bytes.Buffer)
	err := toml.NewEncoder(buffer).Encode(config)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error encoding TOML\n%s", err)
	}
	os.WriteFile(filePath, buffer.Bytes(), 0644)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error writing file \"%s\"\n%s", filePath, err)
	}
}
