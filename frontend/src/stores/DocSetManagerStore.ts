import { action, makeObservable, observable } from 'mobx';

import { doesPathExist } from 'services/path';
import { removeDir, removeFile, rename, writeFile } from 'services/fs';
import { importSearchIndex, openDB, tableDoesNotExist } from 'services/db';
import {
  decompressDocSetArchive,
  downloadDocSet,
  downloadDocSetIcons,
  loadDocSet,
} from 'services/docSetManager';
import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';
import { DocSetStore } from './DocSetStore';
import { DocSetFeedStore } from './DocSetFeedStore';

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
      removeDownloadProgress: action,
      installDocSet: action,
      updateDocSet: action,
    });
  }

  updateDownloadProgress(name: string, progress: number) {
    this.docSetDownloadProgress[name] = Math.round(progress);
  }

  removeDownloadProgress(name: string) {
    if (name in this.docSetDownloadProgress) {
      delete this.docSetDownloadProgress[name];
    }
  }

  async installDocSet(url: string, name: string, version: string) {
    try {
      if (!(name in this.docSetDownloadProgress)) {
        this.updateDownloadProgress(name, 0);

        const docSetsPath = this.settingsStore.docSetsPath;
        const docSetsIconsUrl = this.settingsStore.docSetsIconsUrl;

        const fileExtension = new URL(url).pathname.split('.').at(-1);
        const docSetArchivePath = `${docSetsPath}${window.pathSeperator}${name}.${fileExtension}`;
        const docSetPath = `${docSetsPath}${window.pathSeperator}${name}.docset`;
        await downloadDocSet(url, docSetArchivePath, (progress, total) => {
          this.updateDownloadProgress(name, (progress / total) * 100);
        });
        await decompressDocSetArchive(docSetArchivePath, docSetsPath);
        await writeFile(
          `${docSetPath}${window.pathSeperator}/version`,
          version,
        );
        await downloadDocSetIcons(docSetsIconsUrl, name, docSetPath);
        await removeFile(docSetArchivePath);

        // Some DocSets don't have a `searchIndex` table in the provided sqlite database, javascript, html, css are
        // some examples. These do appear to have an XML file containing enough data to rebuild the `searchIndex`
        // table, so we attempt to do that here.
        const docSet = await loadDocSet(docSetPath);
        const docSetStore = new DocSetStore(docSet);
        await openDB(docSetStore.dbPath);
        if (
          (await tableDoesNotExist(docSetStore.dbPath, 'searchIndex')) &&
          (await doesPathExist(docSetStore.tokensXmlPath))
        ) {
          await importSearchIndex(
            docSetStore.dbPath,
            docSetStore.tokensXmlPath,
          );
        }

        // TODO: experimenting with spellfix sqlite extension for fuzzy matching
        // await createFuzzySearchIndex(docSetStore.dbPath);
      }
    } catch (error) {
      this.errorsStore.addError(error as Error);
    } finally {
      this.removeDownloadProgress(name);
    }
  }

  async updateDocSet(docSet: DocSetStore, docSetFeedStore: DocSetFeedStore) {
    try {
      await rename(docSet.path, `${docSet.path}-old`);

      const urls = docSetFeedStore.getDocSetUrls(docSet.feedEntryName);
      const version = docSetFeedStore.getDocSetVersion(docSet.feedEntryName);
      if (urls.length > 0) {
        await this.installDocSet(urls[0], docSet.feedEntryName, version);
      }

      await removeDir(`${docSet.path}-old`);
    } catch (error) {
      this.errorsStore.addError(error as Error);
    }
  }
}
