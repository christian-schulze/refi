import type { Actor, MachineConfig } from 'xstate';
import { createActor, createMachine } from 'xstate';

import { DocSetFeedStore } from 'stores/DocSetFeedStore';

export type DocSetFeedEvent =
  | { type: 'LOAD_DOWNLOADED_TIMESTAMP' }
  | { type: 'LOAD_DOWNLOADED_TIMESTAMP_SUCCEEDED' }
  | { type: 'LOAD_DOWNLOADED_TIMESTAMP_FAILED' }
  | { type: 'DOWNLOAD_DOCSET_FEED_SUCCEEDED' }
  | { type: 'DOWNLOAD_DOCSET_FEED_FAILED' }
  | { type: 'LOAD_DOCSET_FEED_SUCCEEDED' }
  | { type: 'LOAD_DOCSET_FEED_FAILED' };

export type DocSetFeedState =
  | 'inactive'
  | 'loadingDownloadedTimestamp'
  | 'loadDownloadedTimestampSucceeded'
  | 'loadDownloadedTimestampFailed'
  | 'downloadingDocSetFeed'
  | 'loadingDocSetFeed'
  | 'loadDocSetFeedSucceeded'
  | 'loadDocSetFeedFailed'
  | 'done';

export const getStateMachineConfig = (
  context: DocSetFeedStore,
): MachineConfig<DocSetFeedStore, DocSetFeedEvent> => {
  return {
    id: 'doc-set-feed',
    initial: 'inactive',
    context,
    states: {
      inactive: {
        on: {
          LOAD_DOWNLOADED_TIMESTAMP: 'loadingDownloadedTimestamp',
        },
      },
      loadingDownloadedTimestamp: {
        entry: ['loadDownloadedTimestamp'],
        on: {
          LOAD_DOWNLOADED_TIMESTAMP_SUCCEEDED:
            'loadDownloadedTimestampSucceeded',
          LOAD_DOWNLOADED_TIMESTAMP_FAILED: 'loadDownloadedTimestampFailed',
        },
      },
      loadDownloadedTimestampSucceeded: {
        always: [
          {
            target: 'downloadingDocSetFeed',
            guard: 'shouldDownloadDocSetFeed',
          },
          'loadingDocSetFeed',
        ],
      },
      loadDownloadedTimestampFailed: {
        always: [{ target: 'done' }],
      },
      downloadingDocSetFeed: {
        entry: ['downloadDocSetFeed'],
        initial: 'downloadingDocSetFeed',
        states: {
          downloadingDocSetFeed: {
            on: {
              DOWNLOAD_DOCSET_FEED_SUCCEEDED: {
                target: 'loadingDownloadedTimestamp',
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
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const createStateMachine = (docSetFeedStore: DocSetFeedStore) => {
  return createMachine(getStateMachineConfig(docSetFeedStore)).provide({
    actions: {
      loadDownloadedTimestamp: ({ context }) => {
        context.loadDocSetFeedDownloadedTimestamp();
      },
      downloadDocSetFeed: ({ context }) => {
        context.downloadDocSetFeed(context.settingsStore.docSetsFeedUrl);
      },
      loadDocSetFeedArchive: ({ context }) => {
        context.loadDocSetFeedArchive();
      },
    },
    guards: {
      shouldDownloadDocSetFeed: ({ context }) => {
        const timestamp = context.docSetFeedDownloadedTimestamp;
        return timestamp > -1 && Date.now() - timestamp > DAY_IN_MS;
      },
    },
  });
};

type DocSetFeedStateMachine = ReturnType<typeof createStateMachine>;
type DocSetFeedActorSubscribeFunction = Parameters<
  Actor<DocSetFeedStateMachine>['subscribe']
>[0];

export const interpretStateMachine = (
  stateMachine: DocSetFeedStateMachine,
  onBeforeTransition: DocSetFeedActorSubscribeFunction,
) => {
  const actor = createActor(stateMachine);

  actor.subscribe(onBeforeTransition);

  return createActor(stateMachine).start();
};
