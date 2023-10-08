import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { DocSet, deleteDocSet, loadDocSets } from 'services/docSetManager';

import { DocSetStore } from './DocSetStore';
import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';

export class DocSetListStore {
  errorsStore: ErrorsStore;
  settingsStore: SettingsStore;

  docSets: {
    [name: string]: DocSetStore;
  } = {};
  loading = false;
  query = '';
  searchResults: Array<DocSetStore> = [];
  selectedSearchResultName = '';

  constructor(errorsStore: ErrorsStore, settingsStore: SettingsStore) {
    this.errorsStore = errorsStore;
    this.settingsStore = settingsStore;

    makeObservable(this, {
      docSets: observable,
      loading: observable,
      query: observable,
      searchResults: observable,
      selectedSearchResultName: observable,
      addDocSet: action,
      setQuery: action,
      setSearchResults: action,
      clearSearchResults: action,
      setSelectedSearchResult: action,
      selectedSearchResult: computed,
      loadDocSets: action,
      deleteDocSet: action,
    });
    this.searchResults = [];
  }

  addDocSet(docSet: DocSet) {
    this.docSets[docSet.name] = new DocSetStore(docSet);
  }

  setQuery(query: string) {
    this.query = query;
  }

  setSearchResults(searchResults: Array<DocSetStore>) {
    this.searchResults = searchResults;
  }

  clearSearchResults() {
    this.query = '';
    if (this.searchResults.length > 0) {
      this.searchResults = Object.values(this.docSets);
      this.selectedSearchResultName = '';
    }
  }

  setSelectedSearchResult(name: string) {
    this.selectedSearchResultName = name;
  }

  get selectedSearchResult() {
    return this.searchResults.find(
      (result) => result.name === this.selectedSearchResultName,
    );
  }

  async loadDocSets() {
    this.loading = true;
    try {
      const docSets = await loadDocSets(this.settingsStore.docSetsPath);
      docSets.forEach(this.addDocSet, this);
      docSets.sort((a, b) => {
        if (a.title > b.title) {
          return 1;
        } else if (a.title < b.title) {
          return -1;
        }
        return 0;
      });
      runInAction(() => {
        this.searchResults = Object.values(this.docSets);
      });
    } catch (error) {
      this.errorsStore.addError(error as Error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async deleteDocSet(name: string) {
    if (name in this.docSets) {
      try {
        await deleteDocSet(this.docSets[name].path);
        runInAction(() => {
          delete this.docSets[name];
        });
      } catch (error) {
        this.errorsStore.addError(error as Error);
      }
    }
  }
}
