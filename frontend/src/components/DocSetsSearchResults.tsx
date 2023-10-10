import { cx } from '@emotion/css';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { ForwardedRef, forwardRef } from 'react';

import { useStores } from 'stores';
import { DocSetStore } from 'stores/DocSetStore';
import { useTheme } from 'themes/utils';

import { List, ListProps } from 'components/List';
import { SearchResultItem } from 'components/SearchResultItem';
import { Typography } from 'components/Typography';

const NoResults = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export interface DocSetsSearchResultsProps {
  className?: string;
  onBlur: ListProps<DocSetStore>['onBlur'];
  onCancel: ListProps<DocSetStore>['onCancel'];
  onSelect: ListProps<DocSetStore>['onSelect'];
}

const DocSetsSearchResultsInner = (
  { className, onBlur, onCancel, onSelect }: DocSetsSearchResultsProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { docSetListStore, docSetAliasStore } = useStores();

  const theme = useTheme();

  const handleSelect: ListProps<DocSetStore>['onSelect'] = (
    selectedDocSet,
    selectionType,
  ) => {
    docSetListStore.setSelectedSearchResult(selectedDocSet.name);
    if (['mouse-click', 'enter-key'].includes(selectionType)) {
      if (onSelect) {
        onSelect(selectedDocSet, selectionType);
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
    <List<DocSetStore>
      autoSelectOnFocus
      className={cx('search-results-list', className)}
      items={docSetListStore.searchResults}
      itemSize={24}
      onBlur={onBlur}
      onCancel={onCancel}
      onSelect={handleSelect}
      ref={ref}
      renderItem={(result, props) => {
        return (
          <SearchResultItem key={result.name} {...props}>
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
      }}
      selectedItem={docSetListStore.selectedSearchResult}
      tabIndex={0}
    />
  );
};

export const DocSetsSearchResults = observer(
  forwardRef(DocSetsSearchResultsInner),
);
