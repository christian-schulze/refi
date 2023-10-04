import { MouseEvent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { lighten } from 'polished';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { useStore } from 'stores';

import { Typography } from 'components/Typography';
import { List } from 'components/List';
import { EditDocSetAliasInput } from './EditDocSetAliasInput';

const DocSetListWrapper = styled(List)`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;

  margin-top: 4px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.background.paper};
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
    border-right: 1px dotted
      ${({ theme }) => lighten(0.05, theme.palette.background.default)};
  }

  > .subtitle2:nth-of-type(2) {
    min-width: 200px;
    max-width: 200px;
    padding-left: 6px;
  }
`;

const DocSetListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  padding-left: 8px;
  padding-right: 12px;

  > .body:first-of-type {
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

export const InstalledDocSetList = observer(() => {
  const docSetListStore = useStore('docSetList');

  const [selectedDocSetName, setSelectedDocSetName] = useState('');

  const handleSelect = (name: string) => {
    setSelectedDocSetName(name);
  };

  const handleClickDelete =
    (name: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      docSetListStore.deleteDocSet(name);
    };

  return (
    <DocSetListWrapper
      header={
        <DocSetListHeader>
          <Typography variant="subtitle2">Docset name</Typography>
          <Typography variant="subtitle2">Alias</Typography>
          <ActionsSection />
        </DocSetListHeader>
      }
      items={Object.values(docSetListStore.docSets).map((docSet) => {
        return (
          <DocSetListItem data-id={docSet.name} key={docSet.name}>
            <Typography variant="body">{docSet.title}</Typography>
            <EditDocSetAliasInput name={docSet.name} />
            <ActionsSection>
              <IconButton onClick={handleClickDelete(docSet.name)} size="small">
                <CloseIcon sx={{ color: 'red' }} />
              </IconButton>
            </ActionsSection>
          </DocSetListItem>
        );
      })}
      itemSize={24}
      onSelect={handleSelect}
      selectedId={selectedDocSetName}
      tabIndex={0}
    />
  );
});
