import { action, computed, makeObservable, observable } from 'mobx';
import { v1 as uuid } from 'uuid';

import { DocSetStore } from './DocSetStore';

export interface SearchResult {
  name: string;
  type: string;
  path: string;
}

export class TabStore {
  id: string = uuid();
  docSet: DocSetStore | null = null;
  docSetDetached = false;
  query: string = '';
  searchInProgress: boolean = false;
  searchResults: Array<SearchResult> = [];
  selectedSearchResultName: string = '';
  visibleSearchResult: SearchResult | undefined;
  currentUrl: string = '';

  constructor(docSet: DocSetStore) {
    makeObservable(this, {
      docSet: observable,
      docSetDetached: observable,
      query: observable,
      searchInProgress: observable,
      searchResults: observable,
      selectedSearchResultName: observable,
      visibleSearchResult: observable,
      currentUrl: observable,
      setDocSet: action,
      detachDocSet: action,
      setQuery: action,
      setSearchInProgress: action,
      setSearchResults: action,
      clearSearchResults: action,
      setSelectedSearchResult: action,
      setVisibleSearchResult: action,
      showSelectedSearchResult: action,
      searchResultPath: computed,
    });
    if (docSet) {
      this.setDocSet(docSet);
    }
    this.visibleSearchResult = undefined;
  }

  setDocSet(docSet: DocSetStore) {
    this.docSet = docSet;
    this.docSetDetached = false;
    this.query = '';
    if (this.searchResults.length > 0) {
      this.searchResults = [];
    }
    this.visibleSearchResult = undefined;
    this.currentUrl = docSet.htmlIndexPath;
  }

  detachDocSet() {
    this.docSetDetached = true;
  }

  setQuery(query: string) {
    this.query = query;
  }

  setSearchInProgress(isSearchInProgress: boolean) {
    this.searchInProgress = isSearchInProgress;
  }

  setSearchResults(searchResults: Array<SearchResult>) {
    this.searchResults = searchResults;
  }

  clearSearchResults() {
    this.query = '';
    if (this.searchResults.length > 0) {
      this.searchResults = [];
      this.selectedSearchResultName = '';
    }
  }

  setSelectedSearchResult(name: string) {
    this.selectedSearchResultName = name;
  }

  setVisibleSearchResult(name: string | null) {
    this.visibleSearchResult = this.searchResults.find(
      (result) => result.name === name,
    );
    this.currentUrl = this.searchResultPath;
  }

  showSelectedSearchResult() {
    this.setVisibleSearchResult(this.selectedSearchResultName);
  }

  get searchResultPath() {
    if (this.visibleSearchResult) {
      return `${this.docSet?.documentsPath}/${this.visibleSearchResult.path}`;
    }
    return '';
  }
}
