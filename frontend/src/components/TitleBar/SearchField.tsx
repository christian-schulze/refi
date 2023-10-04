import {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { autorun, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { darken } from 'polished';

import { openDB, searchDocSet } from 'services/db';
import { useStore } from 'stores';

import { DocSetSearchResults } from 'components/DocSetSearchResults';
import { DocSetsSearchResults } from 'components/DocSetsSearchResults';
import { Input } from 'components/Input';
import { BackspaceIcon } from 'components/icons/BackspaceIcon';
import { Spinner } from 'components/Spinner';

const Container = styled.div`
  position: relative;
`;

const DocSetIcon = styled.img`
  max-width: 16px;
  max-height: 16px;
  margin-left: 6px;
`;

const BackspaceIconWrapper = styled(BackspaceIcon)`
  margin-right: 6px;
`;

const SearchResultsContainer = styled.div`
  position: absolute;
  top: 32px;
  left: -25%;
  width: 150%;
  min-height: 100px;
  max-height: 300px;
  display: flex;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.background.default};
  box-shadow: 0 0 2px 3px
    ${({ theme }) => darken(0.2, theme.palette.background.default)};

  :focus-within {
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }

  .search-results-list {
    flex-grow: 1;
  }
`;

export const SearchField = observer(() => {
  const dbRef = useRef<string | null>(null);
  const tabsStore = useStore('tabs');
  const docSetListStore = useStore('docSetList');
  const docSetAliasStore = useStore('docSetAliases');
  const errorsStore = useStore('errors');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTextTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [query, setQuery] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const searchResultsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return reaction(
      () => tabsStore.currentTab?.docSet?.dbPath,
      async (dbPath) => {
        if (dbPath) {
          try {
            await openDB(dbPath);
            dbRef.current = dbPath;
          } catch (error) {
            errorsStore.addError(error as Error);
            dbRef.current = null;
          }
        }
      },
      { fireImmediately: true },
    );
  }, []);

  useEffect(() => {
    return autorun(() => {
      if (tabsStore.currentTab?.query) {
        setQuery(tabsStore.currentTab.query);
      } else {
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
        }
        setQuery('');
        setSearchResultsOpen(false);
      }
    });
  }, []);

  useEffect(() => {
    return autorun(() => {
      if (!docSetListStore.query) {
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
        }
        setQuery('');
        setSearchResultsOpen(false);
      }
    });
  }, []);

  const handleChangeSearchText: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setQuery(event.target.value);

    if (searchTextTimeoutIdRef.current) {
      clearTimeout(searchTextTimeoutIdRef.current);
    }

    if (!event.target.value) {
      if (tabsStore.currentTab && !tabsStore.currentTab.docSetDetached) {
        tabsStore.currentTab.clearSearchResults();
      } else {
        docSetListStore.clearSearchResults();
        docSetListStore.setSearchResults(
          Object.values(docSetListStore.docSets),
        );
      }
      return;
    }

    searchTextTimeoutIdRef.current = setTimeout(
      async () => {
        setSearchResultsOpen(true);
        if (
          dbRef.current &&
          tabsStore.currentTab &&
          !tabsStore.currentTab.docSetDetached
        ) {
          tabsStore.currentTab.setQuery(event.target.value);
          tabsStore.currentTab.setSearchInProgress(true);
          let results: Awaited<ReturnType<typeof searchDocSet>> = [];
          try {
            results = await searchDocSet(
              dbRef.current,
              `%${event.target.value}%`,
            );
          } catch (error) {
            console.error(
              'handleChangeSearchText => Error querying database',
              error,
            );
            errorsStore.addError(error as Error);
          } finally {
            tabsStore.currentTab.setSearchInProgress(false);
          }
          console.log('**************** setSearchResults', results);
          tabsStore.currentTab.setSearchResults(results);
        } else {
          docSetListStore.setQuery(event.target.value);
          const results = Object.values(docSetListStore.docSets).filter(
            (docSet) => {
              return (
                docSetAliasStore.aliases[docSet.name] ===
                  event.target.value.toLowerCase() ||
                docSet.name
                  .toLowerCase()
                  .includes(event.target.value.toLowerCase())
              );
            },
          );
          docSetListStore.setSearchResults(results);
        }
      },
      tabsStore.currentTab ? 400 : 0,
    );
  };

  const handleClearSearchText: MouseEventHandler<SVGSVGElement> = (_event) => {
    setQuery('');
    if (tabsStore.currentTab && !tabsStore.currentTab.docSetDetached) {
      tabsStore.currentTab.clearSearchResults();
    } else {
      docSetListStore.clearSearchResults();
    }
  };

  const handleBlurInput: FocusEventHandler<HTMLInputElement> = (_event) => {
    if (searchResultsOpen) {
      setSearchResultsOpen(false);
    }
  };

  const handleFocusInput: FocusEventHandler<HTMLInputElement> = (_event) => {
    if (
      !searchResultsOpen &&
      (docSetListStore.query ||
        (tabsStore.currentTab?.query && tabsStore.currentTab?.query !== ''))
    ) {
      setSearchResultsOpen(true);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (['ArrowUp', 'ArrowDown'].includes(event.key) && searchResultsOpen) {
      event.preventDefault();
      const keyboardEvent = new KeyboardEvent(event.type, {
        altKey: event.altKey,
        bubbles: event.bubbles,
        ctrlKey: event.ctrlKey,
        code: event.code,
        key: event.key,
        location: event.location,
        metaKey: event.metaKey,
        repeat: event.repeat,
        shiftKey: event.shiftKey,
      });
      searchResultsListRef.current?.dispatchEvent(keyboardEvent);
    } else if (event.key === 'ArrowDown' && !searchResultsOpen) {
      if (
        (tabsStore.currentTab &&
          tabsStore.currentTab.searchResults.length > 0) ||
        docSetListStore.searchResults.length > 0
      ) {
        setSearchResultsOpen(true);
      }
    } else if (event.key === 'Enter') {
      if (searchResultsOpen && tabsStore.currentTab?.selectedSearchResultName) {
        tabsStore.currentTab.showSelectedSearchResult();
        setSearchResultsOpen(false);
      } else if (
        searchResultsOpen &&
        docSetListStore.selectedSearchResultName
      ) {
        const docSet =
          docSetListStore.docSets[docSetListStore.selectedSearchResultName];
        if (tabsStore.currentTab) {
          tabsStore.currentTab.setDocSet(docSet);
        } else {
          tabsStore.addTab(docSet);
          tabsStore.selectTab(docSet.name);
        }
        docSetListStore.clearSearchResults();
        setSearchResultsOpen(false);
      } else if (
        !searchResultsOpen &&
        tabsStore.currentTab &&
        tabsStore.currentTab.searchResults.length > 0
      ) {
        setSearchResultsOpen(true);
      } else if (
        !searchResultsOpen &&
        docSetListStore.searchResults.length > 0
      ) {
        setSearchResultsOpen(true);
      }
    } else if (
      event.key === 'Backspace' &&
      event.currentTarget.value === '' &&
      tabsStore.currentTab
    ) {
      tabsStore.currentTab.detachDocSet();
    } else if (event.key === 'Escape') {
      setSearchResultsOpen(false);
    } else if (
      event.key === ':' &&
      (!tabsStore.currentTab || tabsStore.currentTab.docSetDetached)
    ) {
      const docSet = docSetListStore.searchResults.find((docSet) => {
        return (
          docSetAliasStore.aliases[docSet.name] === query.toLowerCase() ||
          docSet.name.toLowerCase() === query.toLowerCase()
        );
      });
      if (docSet) {
        event.preventDefault();
        if (tabsStore.currentTab) {
          tabsStore.currentTab.setDocSet(docSet);
        } else {
          tabsStore.addTab(docSet);
          tabsStore.selectTab(docSet.name);
        }
        docSetListStore.clearSearchResults();
        setSearchResultsOpen(false);
      }
    }
  };

  const handleCancelSelectSearch = () => {
    setSearchResultsOpen(false);
    searchInputRef.current?.focus();
  };

  const handleSelectSearchResult = (name: string) => {
    if (tabsStore.currentTab && tabsStore.currentTab.docSetDetached) {
      tabsStore.currentTab.setDocSet(docSetListStore.docSets[name]);
      docSetListStore.clearSearchResults();
    } else if (tabsStore.currentTab) {
      tabsStore.currentTab.setVisibleSearchResult(name);
    } else {
      const docSet = docSetListStore.docSets[name];
      tabsStore.addTab(docSet);
    }
    setSearchResultsOpen(false);
  };

  const handleBlurSearchResults: FocusEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (event.relatedTarget !== searchInputRef.current) {
      setSearchResultsOpen(false);
    }
  };

  const renderDockSetIcon = () => {
    if (
      tabsStore.currentTab &&
      tabsStore.currentTab.docSet &&
      !tabsStore.currentTab.docSetDetached
    ) {
      return (
        <DocSetIcon
          src={tabsStore.currentTab.docSet.iconPath}
          alt="current docset icon"
        />
      );
    }
  };

  const renderEndAdornment = () => {
    return (
      <>
        {tabsStore.currentTab?.searchInProgress ? (
          <Spinner style={{ marginRight: '8px' }} />
        ) : null}
        {query ? (
          <BackspaceIconWrapper onClick={handleClearSearchText} />
        ) : null}
      </>
    );
  };

  return (
    <Container>
      <Input
        className="search-input"
        endAdornment={renderEndAdornment()}
        disableUnderline
        inputRef={searchInputRef}
        onChange={handleChangeSearchText}
        onBlur={handleBlurInput}
        onFocus={handleFocusInput}
        onKeyDown={handleKeyDown}
        placeholder="Enter search text"
        startAdornment={renderDockSetIcon()}
        sx={{
          width: '300px',
          borderRadius: '4px',
          '.MuiInputBase-input': {
            padding: '2px 6px',
          },
          border: '1px solid transparent',
          '&:focus-within': {
            border: (theme) => `1px solid ${theme.palette.secondary.main}`,
          },
          backgroundColor: 'primary.main',
          ':hover': {
            background: (theme) => darken(0.1, theme.palette.primary.main),
          },
          ':focus-within': {
            background: (theme) => darken(0.2, theme.palette.primary.main),
          },
        }}
        value={query}
      />
      {searchResultsOpen ? (
        <SearchResultsContainer>
          {tabsStore.currentTab && !tabsStore.currentTab.docSetDetached ? (
            <DocSetSearchResults
              onBlur={handleBlurSearchResults}
              onCancel={handleCancelSelectSearch}
              onSelect={handleSelectSearchResult}
              ref={searchResultsListRef}
            />
          ) : (
            <DocSetsSearchResults
              onBlur={handleBlurSearchResults}
              onCancel={handleCancelSelectSearch}
              onSelect={handleSelectSearchResult}
              ref={searchResultsListRef}
            />
          )}
        </SearchResultsContainer>
      ) : null}
    </Container>
  );
});