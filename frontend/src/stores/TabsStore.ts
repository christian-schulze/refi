import { action, makeObservable, observable } from 'mobx';

import { TabStore } from './TabStore.ts';
import { ErrorsStore } from './ErrorsStore.ts';
import { DocSetStore } from './DocSetStore.ts';

export class TabsStore {
  errorsStore: ErrorsStore;
  
  tabs: Array<TabStore> = [];
  currentTab: TabStore | null = null;

  constructor(errorsStore: ErrorsStore) {
    this.errorsStore = errorsStore;

    makeObservable(this, {
      tabs: observable,
      currentTab: observable,
      addTab: action,
      updateTab: action,
      updateTabById: action,
      closeTab: action,
      closeTabById: action,
      selectTab: action,
    });
    this.currentTab = null;
  }

  addTab(docSet: DocSetStore) {
    this.tabs.push(new TabStore(docSet));
  }

  updateTab(name: string, docSet: DocSetStore) {
    const index = this.tabs.findIndex((tabStore) => tabStore.docSet?.name === name);
    if (index > -1) {
      this.tabs[index].setDocSet(docSet);
    }
  }

  updateTabById(id: string, docSet: DocSetStore) {
    const index = this.tabs.findIndex((tabStore) => tabStore.id === id);
    if (index > -1) {
      this.tabs[index].setDocSet(docSet);
    }
  }

  closeTab(name: string) {
    const index = this.tabs.findIndex((tabStore) => tabStore.docSet?.name === name);
    if (index > -1) {
      if (this.currentTab?.docSet?.name === name) {
        this.currentTab.clearSearchResults();
        this.currentTab = null;
      }
      this.tabs.splice(index, 1);
    }
  }

  closeTabById(id: string) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index > -1) {
      if (this.currentTab?.id === id) {
        this.currentTab.clearSearchResults();
        this.currentTab = null;
      }
      this.tabs.splice(index, 1);
    }
  }

  closeCurrentTab() {
    if (this.currentTab?.docSet) {
      this.closeTab(this.currentTab.docSet.name);
    }
  }

  selectTab(name: string) {
    const currentTab = this.tabs.find((tabStore) => tabStore.docSet?.name === name);
    if (currentTab) {
      this.currentTab = currentTab;
    }
  }
}
