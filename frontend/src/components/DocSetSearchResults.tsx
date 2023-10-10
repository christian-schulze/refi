import { cx } from '@emotion/css';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { ForwardedRef, forwardRef } from 'react';

import { useStores } from 'stores';
import { SearchResult } from 'stores/TabStore';

import { List, ListProps } from 'components/List';
import { SearchResultItem } from 'components/SearchResultItem';
import { Typography } from 'components/Typography';

const StyledToken = styled(Typography)`
  flex-grow: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const NoResults = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export interface DocSetSearchResultsProps {
  className?: string;
  onBlur: ListProps<SearchResult>['onBlur'];
  onCancel: ListProps<SearchResult>['onCancel'];
  onSelect: ListProps<SearchResult>['onSelect'];
}

const DocSetSearchResultsInner = (
  { className, onBlur, onCancel, onSelect }: DocSetSearchResultsProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { tabsStore } = useStores();

  const handleSelect: ListProps<SearchResult>['onSelect'] = (
    selectedSearchResult,
    selectionType,
  ) => {
    tabsStore.currentTab?.setSelectedSearchResult(selectedSearchResult);
    if (['mouse-click', 'enter-key'].includes(selectionType)) {
      onSelect(selectedSearchResult, selectionType);
    }
  };

  if (tabsStore.currentTab?.searchResults.length === 0) {
    return (
      <NoResults>
        <Typography variant="body">No search results found.</Typography>
      </NoResults>
    );
  }

  return (
    <List<SearchResult>
      autoSelectOnFocus
      className={cx('search-results-list', className)}
      items={tabsStore.currentTab?.searchResults.slice(0, 100)}
      itemSize={24}
      onBlur={onBlur}
      onCancel={onCancel}
      onSelect={handleSelect}
      ref={ref}
      renderItem={(result, props) => {
        return (
          <SearchResultItem key={result.id} {...props}>
            <StyledToken variant="body">{result.name}</StyledToken>
            <Typography variant="body">{result.type}</Typography>
          </SearchResultItem>
        );
      }}
      selectedItem={tabsStore.currentTab?.visibleSearchResult}
      tabIndex={0}
    />
  );
};

export const DocSetSearchResults = observer(
  forwardRef(DocSetSearchResultsInner),
);
