import { DownloadFeedArchive, ReadFeedArchive } from '../../wailsjs/go/docsets/DocSets';
import {
  doesPathExist,
  getDocSetFeedPath,
  getDocSetFeedTimestampPath,
} from 'services/path';
import { readTextFile, writeFile } from 'services/fs';

export interface DocSetFeed {
  [key: string]: string;
}

export const getLastDownloadedTimestamp = async () => {
  const docSetFeedTimestampPath = await getDocSetFeedTimestampPath();
  if (await doesPathExist(docSetFeedTimestampPath)) {
    const json = JSON.parse(await readTextFile(docSetFeedTimestampPath));
    return json.lastDownloaded;
  }
  return 0;
};

export const downloadDocSetFeed = async (
  docSetsFeedUrl: string,
): Promise<void> => {
  const docSetFeedPath = await getDocSetFeedPath();
  const error = await DownloadFeedArchive(docSetsFeedUrl, docSetsFeedUrl, docSetFeedPath)
  if (error) {
    throw new Error(`Error downloading docset feed<br />${error}`);
  } else {
    const docSetFeedTimestampPath = await getDocSetFeedTimestampPath();
    await writeFile(
      docSetFeedTimestampPath,
      JSON.stringify({ lastDownloaded: Date.now() }),
    );
  }
};

export const readDocSetFeedArchive = async (): Promise<DocSetFeed> => {
  const docSetFeedPath = await getDocSetFeedPath();
  const docSets = await ReadFeedArchive(docSetFeedPath);
  return docSets;
};
