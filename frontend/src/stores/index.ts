import { Context, createContext, useContext } from 'react';

import { DocSetAliasStore } from './DocSetAliasStore';
import { DocSetManagerStore } from './DocSetManagerStore';
import { DocSetFeedStore } from './DocSetFeedStore';
import { DocSetListStore } from './DocSetListStore';
import { ErrorsStore } from './ErrorsStore';
import { SettingsStore } from './SettingsStore';
import { TabsStore } from './TabsStore';

const errorsStore = new ErrorsStore();
const settingsStore = new SettingsStore(errorsStore);
const tabsStore = new TabsStore(errorsStore);
const docSetAliasStore = new DocSetAliasStore(errorsStore);
const docSetManagerStore = new DocSetManagerStore(errorsStore, settingsStore);
const docSetListStore = new DocSetListStore(errorsStore, settingsStore);
const docSetFeedStore = new DocSetFeedStore(errorsStore, settingsStore);

export const stores = {
  docSetAliasStore,
  docSetManagerStore,
  docSetFeedStore,
  docSetListStore,
  errorsStore,
  settingsStore,
  tabsStore,
};

export const storesContext: Context<typeof stores> = createContext(stores);
export const StoresProvider = storesContext.Provider;

export const useStores = () => useContext(storesContext);
