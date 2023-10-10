import type { Interpreter, MachineConfig, StateMachine } from 'xstate';
import { State, createMachine, interpret } from 'xstate';

import { DocSetFeedStore } from 'stores/DocSetFeedStore';

// TODO: This was an experiment to implement the DocSet feed downloading process as an xstate state machine.
//   I enjoyed solving this and the result works quite well. However, there is significant learning curve and
//   complexity when using xstate, so the process being modelled needs to be of moderate complexity to justify
//   the effort.
//   Its also clear that xstate's typescript support is far too manual, and their experimental typegen feature
//   gives only very basic and partial type coverage. I would like to see everything inferred from the state machine
//   definition object. This would allow building the state machine via Stately's excellent visualisation tool
//   here: https://stately.ai/viz, then getting full type coverage with almost no manually typing, something akin to
//   how Zod infers the interfaces it validates.
//   I will likely replace this state machine with a simple set of function calls in the future.

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

export type DocSetFeedTypestate =
  | {
      value: 'inactive';
      context: DocSetFeedStore;
    }
  | {
      value: 'loadingDownloadedTimestamp';
      context: DocSetFeedStore;
    }
  | {
      value: 'loadDownloadedTimestampSucceeded';
      context: DocSetFeedStore;
    }
  | {
      value: 'loadDownloadedTimestampFailed';
      context: DocSetFeedStore;
    }
  | {
      value: 'downloadingDocSetFeed';
      context: DocSetFeedStore;
    }
  | {
      value: 'loadingDocSetFeed';
      context: DocSetFeedStore;
    }
  | {
      value: 'loadDocSetFeedSucceeded';
      context: DocSetFeedStore;
    }
  | {
      value: 'loadDocSetFeedFailed';
      context: DocSetFeedStore;
    }
  | {
      value: 'done';
      context: DocSetFeedStore;
    };

export type DocSetFeedStateMachine = StateMachine<
  DocSetFeedStore,
  any,
  DocSetFeedEvent,
  DocSetFeedTypestate
>;

export type DocSetFeedInterpretter = Interpreter<
  DocSetFeedStore,
  any,
  DocSetFeedEvent,
  DocSetFeedTypestate,
  any
>;

export type OnTransitionHandler = (
  state: State<DocSetFeedStore, DocSetFeedEvent, any, DocSetFeedTypestate, any>,
  event: DocSetFeedEvent,
) => void;

export const docSetFeedMachineDefinition: MachineConfig<
  DocSetFeedStore,
  any,
  DocSetFeedEvent
> = {
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const createStateMachine = (
  docSetFeedStore: DocSetFeedStore,
): DocSetFeedStateMachine => {
  return createMachine<DocSetFeedStore, DocSetFeedEvent, DocSetFeedTypestate>(
    docSetFeedMachineDefinition,
    {
      actions: {
        loadDownloadedTimestamp: (context, _event) => {
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
    },
  ).withContext(docSetFeedStore);
};

export const interpretStateMachine = (
  stateMachine: DocSetFeedStateMachine,
  onTransition: OnTransitionHandler,
): DocSetFeedInterpretter => {
  return interpret(stateMachine).onTransition(onTransition).start();
};
