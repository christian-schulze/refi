import { action, computed, makeObservable, observable } from 'mobx';

import { DocSet } from 'services/docSetManager';

export class DocSetStore {
  name: string = '';
  path: string = '';
  relativeHtmlIndexPath: string = '';
  title: string = '';

  constructor(docSet: DocSet) {
    makeObservable(this, {
      name: observable,
      path: observable,
      relativeHtmlIndexPath: observable,
      title: observable,
      setDocSet: action,
      dbPath: computed,
      documentsPath: computed,
      htmlIndexPath: computed,
      iconPath: computed,
    });
    if (docSet) {
      this.setDocSet(docSet);
    }
  }

  setDocSet(docSet: DocSet) {
    this.name = docSet.name;
    this.path = docSet.path;
    this.relativeHtmlIndexPath = docSet.relativeHtmlIndexPath;
    this.title = docSet.title;
    return this;
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
