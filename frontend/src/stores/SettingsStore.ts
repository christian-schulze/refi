import { action, makeObservable, observable, runInAction } from 'mobx';

import { loadSettings, writeSettings } from 'services/config';
import {
  doesPathExist,
  getConfigFilePath,
  getDefaultDocSetsDir,
} from 'services/path';

import { ErrorsStore } from './ErrorsStore';

const DEFAULT_CONFIG = {
  docSetsFeedUrl: 'https://github.com/Kapeli/feeds/archive/master.zip',
  docSetsIconsUrl:
    'https://raw.githubusercontent.com/christian-schulze/Dash-X-Platform-Resources/master/docset_icons/',
};

export interface SettingsItem {
  id: string;
  label: string;
}

export const SettingsItems: Array<SettingsItem> = [
  { id: 'settings-list-item-docsets', label: 'DocSets' },
  { id: 'settings-list-item-general', label: 'General' },
];

export class SettingsStore {
  errorsStore: ErrorsStore;

  selectedSettingsId = SettingsItems[0].id;

  docSetsFeedUrl = '';
  docSetsIconsUrl = '';
  docSetsPath = '';

  constructor(errorsStore: ErrorsStore) {
    this.errorsStore = errorsStore;

    makeObservable(this, {
      selectedSettingsId: observable,

      docSetsFeedUrl: observable,
      docSetsIconsUrl: observable,
      docSetsPath: observable,

      setSelectedSettingsId: action,

      loadSettings: action,
      saveSettings: action,
    });
  }

  setSelectedSettingsId(id: string) {
    this.selectedSettingsId = id;
  }

  async loadSettings() {
    try {
      const configFilePath = await getConfigFilePath();
      if (!(await doesPathExist(configFilePath))) {
        const docSetsPath = await getDefaultDocSetsDir();
        await writeSettings(configFilePath, { ...DEFAULT_CONFIG, docSetsPath });
      }
      const config = await loadSettings(configFilePath);
      runInAction(() => {
        this.docSetsFeedUrl = config.docSetsFeedUrl.toString();
        this.docSetsIconsUrl = config.docSetsIconsUrl.toString();
        this.docSetsPath = config.docSetsPath.toString();
      });
    } catch (error) {
      this.errorsStore.addError(error as Error);
    }
  }

  async saveSettings() {
    try {
      const configFilePath = await getConfigFilePath();
      await writeSettings(configFilePath, {
        docSetsFeedUrl: this.docSetsFeedUrl,
        docSetsIconsUrl: this.docSetsIconsUrl,
        docSetsPath: this.docSetsPath,
      });
    } catch (error) {
      this.errorsStore.addError(error as Error);
    }
  }
}
