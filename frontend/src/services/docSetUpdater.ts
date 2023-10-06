import { DocSetFeedStore } from '../stores/DocSetFeedStore';
import { DocSetListStore } from '../stores/DocSetListStore';

// a > b return 1
// a === b return 0
// a < b return -1
export const checkVersionString = (a: string, b: string) => {
  const x = a.split('.').map((e) => parseInt(e, 10));
  const y = b.split('.').map((e) => parseInt(e, 10));

  for (const i in x) {
    y[i] = y[i] || 0;

    if (x[i] === y[i]) {
      continue;
    }

    if (x[i] > y[i]) {
      return 1;
    }
    return -1;
  }

  return y.length > x.length ? -1 : 0;
};

export const checkForUpdatableDocSets = (
  docSetListStore: DocSetListStore,
  docSetFeedStore: DocSetFeedStore,
) => {
  for (let name of Object.keys(docSetListStore.docSets)) {
    const docSet = docSetListStore.docSets[name];
    const currentVersion = docSet.version.replaceAll(/[\n\/]/g, '');
    const latestVersion = docSetFeedStore
      .getDocSetVersion(docSet.feedEntryName)
      .replaceAll(/[\n\/]/g, '');

    console.log(
      'checkForUpdatableDocSets: ',
      name,
      latestVersion,
      currentVersion,
      checkVersionString(latestVersion, currentVersion),
      docSetFeedStore.docSetFeedEntries[docSet.feedEntryName],
    );

    if (checkVersionString(latestVersion, currentVersion) === 1) {
      docSet.setUpdatable(true);
    }
  }
};
