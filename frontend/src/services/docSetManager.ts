import { EventsOn } from '../../wailsjs/runtime';
import { RemoveDir } from '../../wailsjs/go/fs/FS';
import {
  DecompressDocSetArchive,
  DownloadFile,
  GetDownloadedDocSetPaths,
} from '../../wailsjs/go/docsets/DocSets';
import { doesPathExist } from './path';
import { readPListFile } from './plistParser';

export interface UploadEventPayload {
  id: string;
  progress: number;
  total: number;
}

export type ProgressHandler = (progress: number, total: number) => void;

export interface DocSet {
  name: string;
  path: string;
  relativeHtmlIndexPath: string;
  title: string;
}

const handlers = new Map<string, ProgressHandler>();
let listening = false;

function listenToUploadEventIfNeeded(): void {
  if (listening) {
    return;
  }
  EventsOn('file_downloader|progress', (payload: UploadEventPayload) => {
    const handler = handlers.get(payload.id);
    if (handler !== void 0) {
      handler(payload.progress, payload.total);
    }
  });
  listening = true;
}

export const downloadDocSet = (
  url: string,
  destinationPath: string,
  progressHandler?: ProgressHandler,
): Promise<string> => {
  if (progressHandler) {
    handlers.set(url, progressHandler);
  }

  listenToUploadEventIfNeeded();

  return DownloadFile(url, url, destinationPath)
    .then((error) => {
      if (error !== '') {
        return Promise.reject(error);
      }
      return '';
    })
    .finally(() => {
      if (progressHandler) {
        handlers.delete(url);
      }
    });
};

export const decompressDocSetArchive = async (
  sourcePath: string,
  destinationPath: string,
): Promise<string> => {
  const error = await DecompressDocSetArchive(sourcePath, destinationPath);
  if (error !== '') {
    return Promise.reject(error);
  }
  return '';
};

export const downloadDocSetIcons = async (
  iconsUrl: string,
  docSetName: string,
  destinationPath: string,
): Promise<Array<string>> => {
  const promises: Array<Promise<string>> = [];

  const iconUrl = `${iconsUrl}${docSetName.toLowerCase()}.png`;
  const iconPath = `${destinationPath}${window.pathSeperator}icon.png`;
  if (!(await doesPathExist(iconPath))) {
    promises.push(
      DownloadFile(iconUrl, iconUrl, iconPath).then((error) => {
        if (error !== '') {
          return Promise.reject(error);
        }
        return '';
      }),
    );
  }

  const icon2xUrl = `${iconsUrl}${docSetName.toLowerCase()}@2x.png`;
  const icon2xPath = `${destinationPath}${window.pathSeperator}icon@2x.png`;
  if (!(await doesPathExist(icon2xPath))) {
    promises.push(DownloadFile(icon2xUrl, icon2xUrl, icon2xPath).then((error) => {
      if (error !== '') {
        return Promise.reject(error);
      }
      return '';
    }));
  }

  return Promise.all(promises);
};

export const deleteDocSet = async (docSetPath: string): Promise<void> => {
  await RemoveDir(docSetPath);
};

export const loadDocSet = async (docSetPath: string): Promise<DocSet> => {
  const indexPList = await readPListFile(
    `${docSetPath}${window.pathSeperator}Contents${window.pathSeperator}Info.plist`,
  );

  return {
    name: indexPList.CFBundleIdentifier.toString(),
    path: docSetPath,
    relativeHtmlIndexPath: indexPList.dashIndexFilePath.toString(),
    title: indexPList.CFBundleName.toString(),
  };
}

export const loadDocSets = async (path: string): Promise<Array<DocSet>> => {
  const docSetPaths = await GetDownloadedDocSetPaths(path);

  const docSets: Array<DocSet> = [];
  for (const docSetPath of docSetPaths) {
    const docSet = await loadDocSet(docSetPath);
    docSets.push(docSet);
  }

  return docSets;
};
