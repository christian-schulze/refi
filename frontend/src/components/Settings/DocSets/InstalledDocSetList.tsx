import { MouseEvent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { lighten } from 'polished';
import styled from '@emotion/styled';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import UpgradeIcon from '@mui/icons-material/Upgrade';

import { useStores } from 'stores';
import { DocSetStore } from 'stores/DocSetStore';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';
import { DotsSpinnerIcon } from 'components/icons/DotsSpinnerIcon';
import { EditDocSetAliasInput } from './EditDocSetAliasInput';

const StyledDocSetList = styled(List)`
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
` as typeof List;

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
  const { docSetFeedStore, docSetListStore, docSetManagerStore } = useStores();

  const [selectedDocSet, setSelectedDocSet] = useState<DocSetStore>();

  const handleSelect: ListProps<DocSetStore>['onSelect'] = (docSet) => {
    setSelectedDocSet(docSet);
  };

  const handleClickUpdate =
    (name: string) => async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const docSet = docSetListStore.docSets[name];
      await docSetManagerStore.updateDocSet(docSet, docSetFeedStore);
      docSetListStore.loadDocSets();
    };

  const handleClickDelete =
    (name: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      docSetListStore.deleteDocSet(name);
    };

  return (
    <StyledDocSetList<DocSetStore>
      header={
        <DocSetListHeader>
          <Typography variant="subtitle2">Docset name</Typography>
          <Typography variant="subtitle2">Alias</Typography>
          <ActionsSection />
        </DocSetListHeader>
      }
      items={Object.values(docSetListStore.docSets)}
      itemSize={24}
      onSelect={handleSelect}
      renderItem={(docSet, props) => {
        const showUpateProgress =
          docSet.feedEntryName in docSetManagerStore.docSetDownloadProgress;
        const showUpdateIconButton = docSet.updatable && !showUpateProgress;
        const showDeleteIconButton = !showUpateProgress;

        return (
          <DocSetListItem key={docSet.name} {...props}>
            <Typography variant="body">{docSet.title}</Typography>
            <EditDocSetAliasInput name={docSet.name} />
            <ActionsSection>
              {showUpateProgress && (
                <Chip
                  color="success"
                  icon={<DotsSpinnerIcon />}
                  label={
                    docSetManagerStore.docSetDownloadProgress[
                      docSet.feedEntryName
                    ] + '%'
                  }
                  size="small"
                />
              )}
              {showUpdateIconButton && (
                <Tooltip
                  title={
                    <>
                      Update the <b>"{docSet.title}"</b> DocSet.
                    </>
                  }
                  placement="left"
                >
                  <IconButton
                    onClick={handleClickUpdate(docSet.name)}
                    size="small"
                  >
                    <UpgradeIcon sx={{ color: 'text.primary' }} />
                  </IconButton>
                </Tooltip>
              )}
              {showDeleteIconButton && (
                <Tooltip
                  title={
                    <>
                      Delete the <b>"{docSet.title}"</b> DocSet.
                    </>
                  }
                  placement="left"
                >
                  <IconButton
                    onClick={handleClickDelete(docSet.name)}
                    size="small"
                  >
                    <CloseIcon sx={{ color: 'red' }} />
                  </IconButton>
                </Tooltip>
              )}
            </ActionsSection>
          </DocSetListItem>
        );
      }}
      selectedItem={selectedDocSet}
      tabIndex={0}
    />
  );
});
