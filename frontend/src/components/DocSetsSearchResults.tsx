import { forwardRef } from 'react';
import { observer } from 'mobx-react-lite';
import { cx } from '@emotion/css';
import styled from '@emotion/styled';

import { useStores } from 'stores';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';
import { SearchResultItem } from 'components/SearchResultItem';
import { useTheme } from '../themes/utils.ts';

const NoResults = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export interface DocSetsSearchResultsProps {
  className?: string;
  onBlur: ListProps['onBlur'];
  onCancel: ListProps['onCancel'];
  onSelect: ListProps['onSelect'];
}

export const DocSetsSearchResults = observer<
  DocSetsSearchResultsProps,
  HTMLDivElement
>(
  forwardRef(({ className, onBlur, onCancel, onSelect }, ref) => {
    const { docSetListStore, docSetAliasStore } = useStores();

    const theme = useTheme();

    const handleSelect: ListProps['onSelect'] = (name, selectionType) => {
      docSetListStore.setSelectedSearchResult(name);
      if (['mouse-click', 'enter-key'].includes(selectionType)) {
        if (onSelect) {
          onSelect(name, selectionType);
        }
      }
    };

    if (docSetListStore.searchResults.length === 0) {
      return (
        <NoResults>
          <Typography variant="body">No matching doc sets found.</Typography>
        </NoResults>
      );
    }

    return (
      <List
        autoSelectOnFocus
        className={cx('search-results-list', className)}
        items={docSetListStore.searchResults.map((result) => {
          return (
            <SearchResultItem data-id={result.name} key={result.name}>
              <Typography variant="body">{result.name}</Typography>
              {docSetAliasStore.aliases[result.name] ? (
                <Typography
                  color={theme.palette.text.disabled}
                  fontWeight="bolder"
                  variant="body"
                >
                  &nbsp;({docSetAliasStore.aliases[result.name]}:)
                </Typography>
              ) : null}
            </SearchResultItem>
          );
        })}
        itemSize={24}
        onBlur={onBlur}
        onCancel={onCancel}
        onSelect={handleSelect}
        ref={ref}
        selectedId={docSetListStore.selectedSearchResultName}
        tabIndex={0}
      />
    );
  }),
);
