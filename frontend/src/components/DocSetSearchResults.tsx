import { forwardRef } from 'react';
import { observer } from 'mobx-react-lite';
import { cx } from '@emotion/css';
import styled from '@emotion/styled';

import { useStore } from 'stores';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';
import { SearchResultItem } from 'components/SearchResultItem';

const NoResults = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export interface DocSetSearchResultsProps {
  className?: string;
  onBlur: ListProps['onBlur'];
  onCancel: ListProps['onCancel'];
  onSelect: ListProps['onSelect'];
}

export const DocSetSearchResults = observer<
  DocSetSearchResultsProps,
  HTMLDivElement
>(
  forwardRef(({ className, onBlur, onCancel, onSelect }, ref) => {
    const tabsStore = useStore('tabs');

    const handleSelect: ListProps['onSelect'] = (name, selectionType) => {
      tabsStore.currentTab?.setSelectedSearchResult(name);
      if (['mouse-click', 'enter-key'].includes(selectionType)) {
        if (onSelect) {
          onSelect(name, selectionType);
        }
      }
    };

    if (tabsStore.currentTab?.searchResults.length === 0) {
      return (
        <NoResults>
          <Typography variant='body'>No search results found.</Typography>
        </NoResults>
      );
    }

    return (
      <List
        autoSelectOnFocus
        className={cx('search-results-list', className)}
        items={tabsStore.currentTab?.searchResults
          .slice(0, 100)
          .map((result) => {
            return (
              <SearchResultItem data-id={result.name} key={result.name}>
                <Typography variant="body">{result.name}</Typography>
              </SearchResultItem>
            );
          })}
        itemSize={24}
        onBlur={onBlur}
        onCancel={onCancel}
        onSelect={handleSelect}
        ref={ref}
        selectedId={tabsStore.currentTab?.selectedSearchResultName}
        tabIndex={0}
      />
    );
  }),
);
