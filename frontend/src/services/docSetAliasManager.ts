import { Aliases } from 'stores/DocSetAliasStore';

import { readTextFile, writeFile } from './fs';
import { doesPathExist, getDocSetAliasConfigPath } from './path';

export const loadDocSetAliases = async () => {
  const docSetAliasConfigPath = await getDocSetAliasConfigPath();

  if (await doesPathExist(docSetAliasConfigPath)) {
    return JSON.parse(await readTextFile(docSetAliasConfigPath));
  }

  return {};
};

export const saveDocSetAliases = async (aliases: Aliases) => {
  const docSetAliasConfigPath = await getDocSetAliasConfigPath();
  await writeFile(docSetAliasConfigPath, JSON.stringify(aliases));
};
