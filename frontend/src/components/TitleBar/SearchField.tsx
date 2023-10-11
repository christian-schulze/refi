import styled from '@emotion/styled';
import { autorun, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { darken } from 'polished';
import {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';

import { searchDocSet } from 'services/indexer.ts';

import { useStores } from 'stores';
import { DocSetStore } from 'stores/DocSetStore';
import { SearchResult } from 'stores/TabStore';

import { DocSetSearchResults } from 'components/DocSetSearchResults';
import { DocSetsSearchResults } from 'components/DocSetsSearchResults';
import { Input } from 'components/Input';
import { Spinner } from 'components/Spinner';
import { BackspaceIcon } from 'components/icons/BackspaceIcon';

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
  const indexRef = useRef<string | null>(null);
  const { tabsStore, docSetListStore, docSetAliasStore, errorsStore } =
    useStores();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTextTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [query, setQuery] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const searchResultsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return reaction(
      () => tabsStore.currentTab?.docSet?.indexPath,
      async (indexPath) => {
        if (indexPath) {
          try {
            indexRef.current = indexPath;
          } catch (error) {
            errorsStore.addError(error as Error);
            indexRef.current = null;
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
          indexRef.current &&
          tabsStore.currentTab &&
          !tabsStore.currentTab.docSetDetached
        ) {
          tabsStore.currentTab.setQuery(event.target.value);
          tabsStore.currentTab.setSearchInProgress(true);
          let results: Awaited<ReturnType<typeof searchDocSet>> = [];
          try {
            results = await searchDocSet(indexRef.current, event.target.value);
          } catch (error) {
            console.error(
              'handleChangeSearchText => Error querying database',
              error,
            );
            errorsStore.addError(error as Error);
          } finally {
            tabsStore.currentTab.setSearchInProgress(false);
          }
          tabsStore.currentTab.setSearchResults(results || []);
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
      if (searchResultsOpen && tabsStore.currentTab?.selectedSearchResult) {
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

  const handleSelectDocSetSearchResult = (result: SearchResult) => {
    if (tabsStore.currentTab) {
      tabsStore.currentTab.setVisibleSearchResult(result);
      setSearchResultsOpen(false);
    }
  };

  const handleSelectDocSetsSearchResult = (result: DocSetStore) => {
    if (tabsStore.currentTab && tabsStore.currentTab.docSetDetached) {
      tabsStore.currentTab.setDocSet(docSetListStore.docSets[result.name]);
      docSetListStore.clearSearchResults();
    } else {
      const docSet = docSetListStore.docSets[result.name];
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
              onSelect={handleSelectDocSetSearchResult}
              ref={searchResultsListRef}
            />
          ) : (
            <DocSetsSearchResults
              onBlur={handleBlurSearchResults}
              onCancel={handleCancelSelectSearch}
              onSelect={handleSelectDocSetsSearchResult}
              ref={searchResultsListRef}
            />
          )}
        </SearchResultsContainer>
      ) : null}
    </Container>
  );
});
