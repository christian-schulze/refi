import { action, makeObservable, observable, runInAction } from 'mobx';
import { createMachine, interpret } from 'xstate';

import {
  downloadDocSetFeed,
  getLastDownloadedTimestamp,
  readDocSetFeedArchive,
} from 'services/docSetFeedDownloader';
import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';

export interface DocSetFeedEntries {
  [name: string]: string;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const docSetFeedMachineDefinition = {
  tsTypes: {} as import('./DocSetFeedStore.typegen').Typegen0,
  id: 'doc-set-feed',
  predictableActionArguments: true,
  initial: 'inactive',
  states: {
    inactive: {
      on: {
        LOAD_DOWNLOADED_TIMESTAMP: 'loadingDownloadedTimestamp',
      },
    },
    loadingDownloadedTimestamp: {
      entry: ['loadDownloadedTimestamp'],
      on: {
        LOAD_DOWNLOADED_TIMESTAMP_SUCCEEDED: 'loadDownloadedTimestampSucceeded',
        LOAD_DOWNLOADED_TIMESTAMP_FAILED: 'loadDownloadedTimestampFailed',
      },
    },
    loadDownloadedTimestampSucceeded: {
      always: [
        {
          target: 'downloadingDocSetFeed',
          cond: 'shouldDownloadDocSetFeed',
        },
        'loadingDocSetFeed',
      ],
    },
    loadDownloadedTimestampFailed: {
      always: [
        { target: 'done' },
      ],
    },
    downloadingDocSetFeed: {
      entry: ['downloadDocSetFeed'],
      initial: 'downloadingDocSetFeed',
      states: {
        downloadingDocSetFeed: {
          on: {
            DOWNLOAD_DOCSET_FEED_SUCCEEDED: {
              target: 'loadingDownloadedTimestamp',
              internal: true,
              actions: ['loadDownloadedTimestamp'],
            },
            DOWNLOAD_DOCSET_FEED_FAILED: { target: '#done' },
          },
        },
        loadingDownloadedTimestamp: {
          on: {
            LOAD_DOWNLOADED_TIMESTAMP_SUCCEEDED: '#loadingDocSetFeed',
            LOAD_DOWNLOADED_TIMESTAMP_FAILED: { target: '#done' },
          },
        },
      },
    },
    loadingDocSetFeed: {
      entry: ['loadDocSetFeedArchive'],
      id: 'loadingDocSetFeed',
      on: {
        LOAD_DOCSET_FEED_SUCCEEDED: 'loadDocSetFeedSucceeded',
        LOAD_DOCSET_FEED_FAILED: 'loadDocSetFeedFailed',
      },
    },
    loadDocSetFeedSucceeded: {
      always: [{ target: 'done' }],
    },
    loadDocSetFeedFailed: {
      always: [{ target: 'done' }],
    },
    done: {
      id: 'done',
      always: [{ target: 'inactive' }],
    },
  },
};

export class DocSetFeedStore {
  errorsStore: ErrorsStore;
  settingsStore: SettingsStore;
  docSetFeedMachine: any;
  docSetFeedService: any;
  state:
    | 'inactive'
    | 'loadingDownloadedTimestamp'
    | 'loadDownloadedTimestampSucceeded'
    | 'loadDownloadedTimestampFailed'
    | 'downloadingDocSetFeed'
    | 'downloadingDocSetFeed'
    | 'loadingDownloadedTimestamp'
    | 'loadingDocSetFeed'
    | 'loadDocSetFeedSucceeded'
    | 'loadDocSetFeedFailed'
    | 'done' = 'inactive';

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

      loadDocSetFeedDownloadedTimestamp: action,
      downloadDocSetFeed: action,
      loadDocSetFeedArchive: action,
    });

    this.initialiseStateMachine();
  }

  initialiseStateMachine() {
    this.docSetFeedMachine = createMachine(docSetFeedMachineDefinition, {
      actions: {
        loadDownloadedTimestamp: (context: this, _event) => {
          context.loadDocSetFeedDownloadedTimestamp();
        },
        downloadDocSetFeed: (context, _event) => {
          context.downloadDocSetFeed(context.settingsStore.docSetsFeedUrl);
        },
        loadDocSetFeedArchive: (context, _event) => {
          context.loadDocSetFeedArchive();
        },
      },
      guards: {
        shouldDownloadDocSetFeed: (context, _event) => {
          const timestamp = context.docSetFeedDownloadedTimestamp;
          return timestamp > -1 && Date.now() - timestamp > DAY_IN_MS;
        },
      },
    }).withContext(this);

    this.docSetFeedService = interpret(this.docSetFeedMachine)
      .onTransition((state: any, _event) => {
        runInAction(() => (this.state = state));
      })
      .start();
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

  send(event: any) {
    this.docSetFeedService.send(event);
  }
}
