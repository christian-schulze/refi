package config

import (
	"bytes"
	"context"
	"fmt"
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

type LoadSettingsResult struct {
	Config ConfigObject `json:"config"`
	Error  string       `json:"error"`
}

func (a *Config) LoadSettings(filePath string) LoadSettingsResult {
	var decoded ConfigObject
	_, err := toml.DecodeFile(filePath, &decoded)
	if err != nil {
		message := fmt.Sprintf("LoadSettings: Error reading file \"%s\"\n%s", filePath, err.Error())
		runtime.LogErrorf(a.ctx, message)
		return LoadSettingsResult{Error: message}
	}

	return LoadSettingsResult{Config: decoded}
}

func (a *Config) WriteSettings(filePath string, config ConfigObject) string {
	buffer := new(bytes.Buffer)
	err := toml.NewEncoder(buffer).Encode(config)
	if err != nil {
		message := fmt.Sprintf("LoadSettings: Error encoding TOML\n%s", err.Error())
		runtime.LogErrorf(a.ctx, message)
		return message
	}
	err = os.WriteFile(filePath, buffer.Bytes(), 0644)
	if err != nil {
		message := fmt.Sprintf("LoadSettings: Error writing file \"%s\"\n%s", filePath, err.Error())
		runtime.LogErrorf(a.ctx, message)
		return message
	}

	return ""
}
