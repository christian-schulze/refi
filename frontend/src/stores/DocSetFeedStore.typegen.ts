
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "downloadDocSetFeed": "";
"loadDocSetFeedArchive": "" | "LOAD_DOWNLOADED_TIMESTAMP_SUCCEEDED";
"loadDownloadedTimestamp": "DOWNLOAD_DOCSET_FEED_SUCCEEDED" | "LOAD_DOWNLOADED_TIMESTAMP";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "shouldDownloadDocSetFeed": "";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "done" | "downloadingDocSetFeed" | "downloadingDocSetFeed.downloadingDocSetFeed" | "downloadingDocSetFeed.loadingDownloadedTimestamp" | "inactive" | "loadDocSetFeedFailed" | "loadDocSetFeedSucceeded" | "loadDownloadedTimestampFailed" | "loadDownloadedTimestampSucceeded" | "loadingDocSetFeed" | "loadingDownloadedTimestamp" | { "downloadingDocSetFeed"?: "downloadingDocSetFeed" | "loadingDownloadedTimestamp"; };
        tags: never;
      }
  