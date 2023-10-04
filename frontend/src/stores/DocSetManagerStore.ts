import { action, makeObservable, observable, runInAction } from 'mobx';

import { doesPathExist } from 'services/path';
import { removeFile } from 'services/fs';
import {
  importSearchIndex,
  openDB,
  tableExists,
} from 'services/db';
import {
  decompressDocSetArchive,
  downloadDocSet,
  downloadDocSetIcons,
  loadDocSet,
  ProgressHandler,
} from 'services/docSetManager';
import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';
import { DocSetStore } from './DocSetStore';

export class DocSetManagerStore {
  errorsStore: ErrorsStore;
  settingsStore: SettingsStore;

  docSetDownloadProgress: {
    [name: string]: number;
  } = {};

  constructor(errorsStore: ErrorsStore, settingsStore: SettingsStore) {
    this.errorsStore = errorsStore;
    this.settingsStore = settingsStore;

    makeObservable(this, {
      docSetDownloadProgress: observable,
      updateDownloadProgress: action,
      downloadDocSet: action,
    });
  }

  updateDownloadProgress(name: string, progress: number) {
    if (name in this.docSetDownloadProgress) {
      this.docSetDownloadProgress[name] = Math.round(progress);
    }
  }

  async downloadDocSet(
    url: string,
    name: string,
    progressHandler: ProgressHandler,
  ) {
    try {
      if (!(name in this.docSetDownloadProgress)) {
        this.docSetDownloadProgress[name] = 0;

        const docSetsPath = this.settingsStore.docSetsPath;
        const docSetsIconsUrl = this.settingsStore.docSetsIconsUrl;

        const fileExtension = new URL(url).pathname.split('.').at(-1);
        const docSetArchivePath = `${docSetsPath}${window.pathSeperator}${name}.${fileExtension}`;
        const docSetPath = `${docSetsPath}${window.pathSeperator}${name}.docset`;
        await downloadDocSet(url, docSetArchivePath, progressHandler);
        await decompressDocSetArchive(docSetArchivePath, docSetsPath);
        await downloadDocSetIcons(docSetsIconsUrl, name, docSetPath);
        await removeFile(docSetArchivePath);

        const docSet = await loadDocSet(docSetPath);
        const docSetStore = new DocSetStore(docSet);
        await openDB(docSetStore.dbPath);
        if (
          !(await tableExists(docSetStore.dbPath, 'searchIndex')) &&
          (await doesPathExist(docSetStore.tokensXmlPath))
        ) {
          await importSearchIndex(
            docSetStore.dbPath,
            docSetStore.tokensXmlPath,
          );
        }

        // experimenting with spellfix sqlite extension for fuzzy matching
        // await createFuzzySearchIndex(docSetStore.dbPath);

        runInAction(() => {
          delete this.docSetDownloadProgress[name];
        });
      }
    } catch (error) {
      this.errorsStore.addError(error as Error);
      delete this.docSetDownloadProgress[name];
    }
  }
}
