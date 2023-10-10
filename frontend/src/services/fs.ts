import {
  CreateDir,
  ReadDir,
  ReadTextFile,
  RemoveDir,
  RemoveFile,
  Rename,
  WriteFile,
} from '../../wailsjs/go/fs/FS';

export const createDir = async (path: string) => {
  const error = await CreateDir(path);
  if (error) {
    throw new Error(error);
  }
};

export const readDir = async (path: string) => {
  const { dirEntries, error } = await ReadDir(path);
  if (error) {
    throw new Error(error);
  }
  return dirEntries;
};

export const readTextFile = async (path: string) => {
  const { data, error } = await ReadTextFile(path);
  if (error) {
    throw new Error(error);
  }
  return data;
};

export const removeDir = async (path: string) => {
  const error = await RemoveDir(path);
  if (error) {
    throw new Error(error);
  }
};

export const removeFile = async (path: string) => {
  const error = await RemoveFile(path);
  if (error) {
    throw new Error(error);
  }
};

export const rename = async (oldPath: string, newPath: string) => {
  const error = await Rename(oldPath, newPath);
  if (error) {
    throw new Error(error);
  }
};

export const writeFile = async (path: string, data: string) => {
  const error = await WriteFile(path, data);
  if (error) {
    throw new Error(error);
  }
};
