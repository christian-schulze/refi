import { DoesPathExist } from '../../wailsjs/go/fs/FS';
import {
  GetAppName,
  GetUserConfigDir,
  GetUserDataDir,
} from '../../wailsjs/go/main/App';

import { createDir } from './fs';

const CONFIG_FILE_NAME = 'config.toml';

export const splitPathAndBaseName = (fullPath: string): [string, string] => {
  const index = fullPath.lastIndexOf(window.pathSeperator);
  const path = fullPath.substring(0, index);
  const baseName = fullPath.substring(index + 1);

  return [path, baseName];
};

export const doesPathExist = (path: string) => DoesPathExist(path);

export const getConfigDir = async (ensureExists = true): Promise<string> => {
  const configDir = `${await GetUserConfigDir()}${
    window.pathSeperator
  }${await GetAppName()}`;

  if (ensureExists && !(await DoesPathExist(configDir))) {
    await createDir(configDir);
  }

  return configDir;
};

export const getDataDir = async (ensureExists = true): Promise<string> => {
  const dataDir = `${await GetUserDataDir()}${
    window.pathSeperator
  }${await GetAppName()}`;

  if (ensureExists && !(await DoesPathExist(dataDir))) {
    await createDir(dataDir);
  }

  return dataDir;
};

export const getConfigFilePath = async (): Promise<string> => {
  const configDir = await getConfigDir();

  return `${configDir}${window.pathSeperator}${CONFIG_FILE_NAME}`;
};

export const getDefaultDocSetsDir = async (
  ensureExists = true,
): Promise<string> => {
  const dataDir = await getDataDir();

  const docSetDir = `${dataDir}${window.pathSeperator}docsets`;

  if (ensureExists && !(await DoesPathExist(docSetDir))) {
    await createDir(docSetDir);
  }

  return docSetDir;
};

export const getDocSetFeedPath = async (): Promise<string> => {
  const dataDir = await getDataDir();

  return `${dataDir}${window.pathSeperator}feed.zip`;
};

export const getDocSetFeedTimestampPath = async (): Promise<string> => {
  const dataDir = await getDataDir();

  return `${dataDir}${window.pathSeperator}feed-timestamp.json`;
};

export const getDocSetAliasConfigPath = async (): Promise<string> => {
  const configDir = await getConfigDir();

  return `${configDir}${window.pathSeperator}aliases.json`;
};
