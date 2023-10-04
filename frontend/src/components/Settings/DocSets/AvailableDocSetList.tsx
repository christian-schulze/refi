import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { darken, lighten } from 'polished';
import styled from 'styled-components';
import Input from '@mui/material/Input';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import { useStore } from 'stores';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';

const DocSetListWrapper = styled(List)`
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
`;

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

const DocSetListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  padding-left: 8px;
  padding-right: 12px;

  > .body:nth-of-type(1) {
    flex-grow: 1;
  }

  ${({ selected, theme }) => {
    if (selected) {
      return `
          background-color: ${theme.palette.secondary.main};
        `;
    }
  }}
`;

const ActionsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 100px;
  border-left: 1px dotted
    ${({ theme }) => lighten(0.05, theme.palette.background.default)};
`;

export const AvailableDocSetList = observer(() => {
  const docSetFeedStore = useStore('docSetFeed');
  const docSetManagerStore = useStore('docSetManager');
  const docSetListStore = useStore('docSetList');

  const [filterValue, setFilterValue] = useState('');
  const [filteredDocSetNames, setFilteredDocSetNames] = useState<Array<string>>(
    [],
  );
  const [selectedDocSetName, setSelectedDocSetName] = useState('');

  useEffect(() => {
    return autorun(() => {
      if (filterValue) {
        const matchingNames = Object.keys(docSetFeedStore.docSetFeedEntries)
          .filter((name) => !(name.toLowerCase() in docSetListStore.docSets))
          .filter((name) => name.includes(filterValue));
        setFilteredDocSetNames(matchingNames);
      } else {
        setFilteredDocSetNames(Object.keys(docSetFeedStore.docSetFeedEntries));
      }
    });
  }, []);

  const handleChangeFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilterValue(value.toLowerCase());
    if (value) {
      const matchingNames = Object.keys(docSetFeedStore.docSetFeedEntries)
        .filter((name) => !(name.toLowerCase() in docSetListStore.docSets))
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()));
      setFilteredDocSetNames(matchingNames);
    } else {
      setFilteredDocSetNames(Object.keys(docSetFeedStore.docSetFeedEntries));
    }
  };

  const handleSelect: ListProps['onSelect'] = (name) => {
    setSelectedDocSetName(name);
  };

  const handleClickDownload =
    (name: string) => async (_event: MouseEvent<HTMLButtonElement>) => {
      const urls = docSetFeedStore.getDocSetUrls(name);
      if (urls.length > 0) {
        await docSetManagerStore.downloadDocSet(
          urls[0],
          name,
          (progress, total) => {
            docSetManagerStore.updateDownloadProgress(
              name,
              (progress / total) * 100,
            );
          },
        );

        docSetListStore.loadDocSets();
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
      <DocSetListWrapper
        header={
          <DocSetListHeader>
            <Typography variant="subtitle2">Docset name</Typography>
            <ActionsSection />
          </DocSetListHeader>
        }
        items={filteredDocSetNames.map((name) => {
          return (
            <DocSetListItem data-id={name} key={name}>
              <Typography variant='body'>{name}</Typography>
              <ActionsSection>
                {docSetManagerStore.docSetDownloadProgress[name] ? (
                  <Chip
                    color="success"
                    label={docSetManagerStore.docSetDownloadProgress[name]}
                    size="small"
                  />
                ) : (
                  <IconButton onClick={handleClickDownload(name)} size="small">
                    <CloudDownloadIcon sx={{ color: 'green' }} />
                  </IconButton>
                )}
              </ActionsSection>
            </DocSetListItem>
          );
        })}
        itemSize={24}
        onSelect={handleSelect}
        selectedId={selectedDocSetName}
        tabIndex={0}
      />
    </>
  );
});
