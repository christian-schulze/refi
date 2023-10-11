import { action, makeObservable, observable, runInAction } from 'mobx';

import { importSearchIndex, openDB, tableDoesNotExist } from 'services/db';
import {
  decompressDocSetArchive,
  downloadDocSet,
  downloadDocSetIcons,
  loadDocSet,
} from 'services/docSetManager';
import { removeDir, removeFile, rename, writeFile } from 'services/fs';
import { closeIndex, createDocSetIndex } from 'services/indexer.ts';
import { doesPathExist } from 'services/path';

import { DocSetFeedStore } from './DocSetFeedStore';
import { DocSetStore } from './DocSetStore';
import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';

export interface DocSetInstallProgress {
  status: 'Queued' | 'Downloading' | 'Extracting' | 'Indexing' | 'Done';
  progress: number;
}

export class DocSetManagerStore {
  errorsStore: ErrorsStore;
  settingsStore: SettingsStore;

  docSetInstallProgress: {
    [name: string]: DocSetInstallProgress;
  } = {};

  constructor(errorsStore: ErrorsStore, settingsStore: SettingsStore) {
    this.errorsStore = errorsStore;
    this.settingsStore = settingsStore;

    makeObservable(this, {
      docSetInstallProgress: observable,
      updateInstallProgress: action,
      removeInstallProgress: action,
      installDocSet: action,
      updateDocSet: action,
    });
  }

  updateInstallStatus(name: string, status: DocSetInstallProgress['status']) {
    if (name in this.docSetInstallProgress) {
      this.docSetInstallProgress[name].status = status;
    } else {
      this.docSetInstallProgress[name] = {
        status,
        progress: 0,
      };
    }
  }

  updateInstallProgress(name: string, progress: number) {
    this.docSetInstallProgress[name].progress = Math.round(progress);
  }

  removeInstallProgress(name: string) {
    if (name in this.docSetInstallProgress) {
      delete this.docSetInstallProgress[name];
    }
  }

  async installDocSet(url: string, name: string, version: string) {
    try {
      if (!(name in this.docSetInstallProgress)) {
        runInAction(() => {
          this.updateInstallStatus(name, 'Queued');
        });

        const docSetsPath = this.settingsStore.docSetsPath;
        const docSetsIconsUrl = this.settingsStore.docSetsIconsUrl;

        const fileExtension = new URL(url).pathname.split('.').at(-1);
        const docSetArchivePath = `${docSetsPath}${window.pathSeperator}${name}.${fileExtension}`;
        const docSetPath = `${docSetsPath}${window.pathSeperator}${name}.docset`;
        await downloadDocSet(url, docSetArchivePath, (progress, total) => {
          runInAction(() => {
            this.updateInstallStatus(name, 'Downloading');
            this.updateInstallProgress(name, (progress / total) * 100);
          });
        });
        runInAction(() => {
          this.updateInstallStatus(name, 'Extracting');
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

        runInAction(() => {
          this.updateInstallStatus(name, 'Indexing');
        });

        await createDocSetIndex(docSetStore.indexPath, docSetStore.dbPath);

        runInAction(() => {
          this.updateInstallStatus(name, 'Done');
        });
      }
    } catch (error) {
      this.errorsStore.addError(error as Error);
    } finally {
      runInAction(() => {
        this.removeInstallProgress(name);
      });
    }
  }

  async reIndexDocSet(docSet: DocSetStore) {
    try {
      runInAction(() => {
        this.updateInstallStatus(docSet.feedEntryName, 'Indexing');
      });
      await closeIndex(docSet.indexPath);
      await removeDir(docSet.indexPath);
      await createDocSetIndex(docSet.indexPath, docSet.dbPath);
    } catch (error) {
      this.errorsStore.addError(error as Error);
    } finally {
      runInAction(() => {
        this.updateInstallStatus(docSet.feedEntryName, 'Done');
      });
    }
  }

  async updateDocSet(docSet: DocSetStore, docSetFeedStore: DocSetFeedStore) {
    try {
      await closeIndex(docSet.indexPath);
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
