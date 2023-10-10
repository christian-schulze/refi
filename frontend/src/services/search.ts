import {
  CreateDocSetIndex,
  SearchDocSet,
} from '../../wailsjs/go/search/Search.js';

export const createDocSetIndex = async (indexPath: string, dbPath: string) => {
  const error = await CreateDocSetIndex(indexPath, dbPath);
  if (error) {
    throw new Error(error);
  }
};

export const searchDocSet = async (indexPath: string, term: string) => {
  const { results, error } = await SearchDocSet(indexPath, term);
  if (error) {
    throw new Error(error);
  }
  return results;
};
