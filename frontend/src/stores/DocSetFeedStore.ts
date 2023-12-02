import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  downloadDocSetFeed,
  getLastDownloadedTimestamp,
  readDocSetFeedArchive,
} from 'services/docSetFeedManager';
import type {
  DocSetFeedEvent,
  DocSetFeedState,
} from 'stateMachines/docSetFeedMachine';
import {
  createStateMachine,
  interpretStateMachine,
} from 'stateMachines/docSetFeedMachine';

import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';

export interface DocSetFeedEntries {
  [name: string]: string;
}

export class DocSetFeedStore {
  errorsStore: ErrorsStore;
  settingsStore: SettingsStore;
  docSetFeedMachine: ReturnType<typeof createStateMachine>;
  docSetFeedService: ReturnType<typeof interpretStateMachine>;
  state: DocSetFeedState = 'inactive';

  docSetFeedDownloadedTimestamp = 0;
  loadingDocSetFeedDownloadedTimestamp = false;
  downloadingDocSetFeed = false;
  docSetFeedEntries: DocSetFeedEntries = {};
  loadingDocSetFeed = false;

  constructor(errorsStore: ErrorsStore, settingsStore: SettingsStore) {
    this.errorsStore = errorsStore;
    this.settingsStore = settingsStore;

    makeObservable(this, {
      docSetFeedDownloadedTimestamp: observable,
      loadingDocSetFeedDownloadedTimestamp: observable,
      downloadingDocSetFeed: observable,
      docSetFeedEntries: observable,
      loadingDocSetFeed: observable,
      state: observable,

      loadDocSetFeedDownloadedTimestamp: action,
      downloadDocSetFeed: action,
      loadDocSetFeedArchive: action,
    });

    this.docSetFeedMachine = createStateMachine(this);
    this.docSetFeedService = interpretStateMachine(
      this.docSetFeedMachine,
      (state) => {
        runInAction(() => {
          console.log('docSetFeedMachine', state.value);
          this.state = state.value as DocSetFeedState;
        });
      },
    );
  }

  async loadDocSetFeedDownloadedTimestamp(): Promise<void> {
    this.loadingDocSetFeedDownloadedTimestamp = true;
    try {
      const docSetFeedDownloadedTimestamp = await getLastDownloadedTimestamp();
      runInAction(() => {
        this.docSetFeedDownloadedTimestamp = docSetFeedDownloadedTimestamp;
      });
      this.send({ type: 'LOAD_DOWNLOADED_TIMESTAMP_SUCCEEDED' });
    } catch (error) {
      this.errorsStore.addError(error as Error);
      this.send({ type: 'LOAD_DOWNLOADED_TIMESTAMP_FAILED' });
    }
    runInAction(() => {
      this.loadingDocSetFeedDownloadedTimestamp = false;
    });
  }

  async downloadDocSetFeed(docSetsFeedUrl: string): Promise<void> {
    this.downloadingDocSetFeed = true;
    try {
      await downloadDocSetFeed(docSetsFeedUrl);
      this.send({ type: 'DOWNLOAD_DOCSET_FEED_SUCCEEDED' });
    } catch (error) {
      this.errorsStore.addError(error as Error);
      this.send({ type: 'DOWNLOAD_DOCSET_FEED_FAILED' });
    }
    runInAction(() => {
      this.downloadingDocSetFeed = false;
    });
  }

  async loadDocSetFeedArchive(): Promise<void> {
    this.loadingDocSetFeed = true;
    try {
      const docSetFeedEntries = await readDocSetFeedArchive();
      runInAction(() => {
        this.docSetFeedEntries = docSetFeedEntries;
      });
      this.send({ type: 'LOAD_DOCSET_FEED_SUCCEEDED' });
    } catch (error) {
      this.errorsStore.addError(error as Error);
      this.send({ type: 'LOAD_DOCSET_FEED_FAILED' });
    }
    runInAction(() => {
      this.loadingDocSetFeed = false;
    });
  }

  loadDocSetFeed(): void {
    this.send({ type: 'LOAD_DOWNLOADED_TIMESTAMP' });
  }

  getDocSetUrls(name: string): Array<string> {
    const domParser = new DOMParser();
    const xmlDocument = domParser.parseFromString(
      this.docSetFeedEntries[name],
      'application/xml',
    );
    return Array.from(xmlDocument.querySelectorAll('entry > url')).map(
      (element) => element.innerHTML,
    );
  }

  getDocSetVersion(name: string): string {
    const domParser = new DOMParser();
    const xmlDocument = domParser.parseFromString(
      this.docSetFeedEntries[name],
      'application/xml',
    );
    return xmlDocument.querySelector('entry > version')?.innerHTML || '';
  }

  send(event: DocSetFeedEvent) {
    this.docSetFeedService.send(event);
  }
}
