import styled from '@emotion/styled';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { darken, lighten } from 'polished';
import { ChangeEvent, useEffect, useState } from 'react';

import { useStores } from 'stores';

import { Input } from 'components/Input';
import { List, ListProps } from 'components/List';
import { Typography } from 'components/Typography';

import { AvailableDocSetItem } from './AvailableDocSetItem';

const StyledDocSetList = styled(List)`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;

  margin-top: 4px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.background.default};
  background-color: ${({ theme }) => theme.palette.background.paper};
  overflow-y: auto;

  :focus-within {
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }
` as typeof List;

const DocSetListHeader = styled.div`
  display: flex;
  padding-left: 8px;
  padding-right: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.background.paper};
  background-color: ${({ theme }) => theme.palette.background.default};

  > .subtitle2:nth-of-type(1) {
    flex-grow: 1;
  }
`;

const ActionsColumnHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 100px;
  border-left: 1px dotted
    ${({ theme }) => lighten(0.05, theme.palette.background.default)};
`;

export const AvailableDocSetList = observer(() => {
  const { docSetFeedStore, docSetListStore, docSetManagerStore } = useStores();

  const [filterValue, setFilterValue] = useState('');
  const [filteredDocSetNames, setFilteredDocSetNames] = useState<Array<string>>(
    [],
  );
  const [selectedDocSetName, setSelectedDocSetName] = useState('');

  useEffect(() => {
    return autorun(() => {
      docSetFeedStore.docSetFeedEntries;
      docSetListStore.docSets;

      filter(filterValue);
    });
  }, [filterValue]);

  const filter = (value: string) => {
    const docSetFeedEntries = Object.keys(docSetFeedStore.docSetFeedEntries);
    const docSetNames = Object.values(docSetListStore.docSets).map(
      (docSet) => docSet.feedEntryName,
    );

    if (value) {
      setFilteredDocSetNames(
        docSetFeedEntries.filter(
          (feedEntryName) =>
            !docSetNames.includes(feedEntryName) &&
            feedEntryName.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    } else {
      setFilteredDocSetNames(
        docSetFeedEntries.filter(
          (feedEntryName) => !docSetNames.includes(feedEntryName),
        ),
      );
    }
  };

  const handleChangeFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilterValue(value.toLowerCase());
    filter(value);
  };

  const handleSelect: ListProps<string>['onSelect'] = (name) => {
    setSelectedDocSetName(name);
  };

  const handleClickDownload = async (name: string) => {
    const urls = docSetFeedStore.getDocSetUrls(name);
    const version = docSetFeedStore.getDocSetVersion(name);
    if (urls.length > 0) {
      await docSetManagerStore.installDocSet(urls[0], name, version);
      await docSetListStore.loadDocSets();
    }
  };

  return (
    <>
      <Input
        disableUnderline
        fullWidth
        onChange={handleChangeFilter}
        placeholder="Search for docsets to add"
        sx={{
          marginTop: '4px',
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
      />
      <StyledDocSetList<string>
        header={
          <DocSetListHeader>
            <Typography variant="subtitle2">Docset name</Typography>
            <ActionsColumnHeader />
          </DocSetListHeader>
        }
        items={filteredDocSetNames}
        itemSize={24}
        onSelect={handleSelect}
        renderItem={(name, props) => {
          return (
            <AvailableDocSetItem
              key={name}
              name={name}
              onClickDownload={handleClickDownload}
              {...props}
            />
          );
        }}
        selectedItem={selectedDocSetName}
        tabIndex={0}
      />
    </>
  );
});
