import { forwardRef } from 'react';
import { observer } from 'mobx-react-lite';
import cx from 'classnames';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';

import { useStore } from 'stores';

import { List, ListProps } from 'components/List';
import { SearchResultItem } from 'components/SearchResultItem';

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
    const docSetListStore = useStore('docSetList');
    const docSetAliasStore = useStore('docSetAliases');

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
          <Typography>No matching doc sets found.</Typography>
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
              <Typography variant="body2">{result.name}</Typography>
              {docSetAliasStore.aliases[result.name] ? (
                <Typography
                  sx={{ color: 'text.disabled', fontWeight: 'bolder' }}
                  variant="body2"
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
