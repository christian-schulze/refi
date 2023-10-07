import { SearchResult } from 'stores/TabStore';

import {
  CreateFuzzySearchIndex,
  ImportSearchIndex,
  OpenDB,
  SearchDocSet,
  TableExists,
} from '../../wailsjs/go/db/DB';

export const createFuzzySearchIndex = async (dbPath: string) => {
  const error = await CreateFuzzySearchIndex(dbPath);
  if (error) {
    throw new Error(error);
  }
};

export const importSearchIndex = async (
  dbPath: string,
  tokenXMLPath: string,
) => {
  const error = await ImportSearchIndex(dbPath, tokenXMLPath);
  if (error) {
    throw new Error(error);
  }
};

export const openDB = async (dbPath: string): Promise<void> => {
  const error = await OpenDB(dbPath);
  if (error) {
    throw new Error(error);
  }
};

export const searchDocSet = async (
  dbPath: string,
  searchTerm: string,
): Promise<Array<SearchResult>> => {
  const { results, error } = await SearchDocSet(dbPath, searchTerm);
  if (error) {
    throw new Error(error);
  }
  return results;
};

export const tableExists = async (
  dbPath: string,
  tableName: string,
): Promise<boolean> => {
  return TableExists(dbPath, tableName);
};

export const tableDoesNotExist = async (dbPath: string, tableName: string) =>
  !(await TableExists(dbPath, tableName));
