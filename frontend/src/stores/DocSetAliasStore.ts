import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  loadDocSetAliases,
  saveDocSetAliases,
} from 'services/docSetAliasManager';

import { ErrorsStore } from './ErrorsStore';

export interface Aliases {
  [name: string]: string;
}

export class DocSetAliasStore {
  errorsStore: ErrorsStore;

  aliases: Aliases = {};
  isDirty: boolean = false;

  constructor(errorsStore: ErrorsStore) {
    this.errorsStore = errorsStore;

    makeObservable(this, {
      aliases: observable,
      isDirty: observable,
      setAlias: action,
      loadAliases: action,
      saveAliases: action,
    });
  }

  setAlias(name: string, alias: string) {
    if (alias !== this.aliases[name]) {
      this.aliases[name] = alias;
      this.isDirty = true;
    }
  }

  async loadAliases() {
    try {
      const aliases = await loadDocSetAliases();
      runInAction(() => {
        this.aliases = aliases;
        this.isDirty = false;
      });
    } catch (error) {
      this.errorsStore.addError(error as Error);
    }
  }

  async saveAliases() {
    try {
      await saveDocSetAliases(this.aliases);
      runInAction(() => {
        this.isDirty = false;
      });
    } catch (error) {
      this.errorsStore.addError(error as Error);
    }
  }
}
