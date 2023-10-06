import { LoadSettings, WriteSettings } from '../../wailsjs/go/config/Config';
import { config } from '../../wailsjs/go/models';

export const loadSettings = async (filePath: string) => {
  const { config, error } = await LoadSettings(filePath);
  if (error) {
    throw new Error(error);
  }
  return config;
};

export const writeSettings = async (
  filePath: string,
  settings: config.ConfigObject,
) => {
  const error = await WriteSettings(filePath, settings);
  if (error) {
    throw new Error(error);
  }
};
