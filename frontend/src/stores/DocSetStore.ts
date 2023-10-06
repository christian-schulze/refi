import { action, computed, makeObservable, observable } from 'mobx';

import { DocSet } from 'services/docSetManager';

export class DocSetStore {
  name: string = '';
  path: string = '';
  relativeHtmlIndexPath: string = '';
  title: string = '';
  version: string = '';
  feedEntryName: string = '';
  updatable: boolean = false;

  constructor(docSet: DocSet) {
    makeObservable(this, {
      name: observable,
      path: observable,
      relativeHtmlIndexPath: observable,
      title: observable,
      version: observable,
      feedEntryName: observable,
      updatable: observable,

      setDocSet: action,
      setUpdatable: action,

      resourcesPath: computed,
      dbPath: computed,
      tokensXmlPath: computed,
      documentsPath: computed,
      htmlIndexPath: computed,
      iconPath: computed,
    });
    this.setDocSet(docSet);
  }

  setDocSet(docSet: DocSet) {
    this.name = docSet.name;
    this.path = docSet.path;
    this.relativeHtmlIndexPath = docSet.relativeHtmlIndexPath;
    this.title = docSet.title;
    this.version = docSet.version;
    this.feedEntryName = docSet.feedEntryName;
    return this;
  }

  setUpdatable(updatable: boolean) {
    this.updatable = updatable;
  }

  get resourcesPath() {
    if (this.path) {
      return `${this.path}${window.pathSeperator}Contents${window.pathSeperator}Resources`;
    }
    return '';
  }

  get dbPath() {
    if (this.path) {
      return `${this.path}${window.pathSeperator}Contents${window.pathSeperator}Resources${window.pathSeperator}docSet.dsidx`;
    }
    return '';
  }

  get tokensXmlPath() {
    if (this.path) {
      return `${this.path}${window.pathSeperator}Contents${window.pathSeperator}Resources${window.pathSeperator}Tokens.xml`;
    }
    return '';
  }

  get documentsPath() {
    if (this.path) {
      return `${this.path}${window.pathSeperator}Contents${window.pathSeperator}Resources${window.pathSeperator}Documents`;
    }
    return '';
  }

  get htmlIndexPath() {
    if (this.path) {
      return `${this.documentsPath}${window.pathSeperator}${this.relativeHtmlIndexPath}`;
    }
    return '';
  }

  get iconPath() {
    if (this.path) {
      return `${this.path}${window.pathSeperator}icon.png`;
    }
    return '';
  }
}
