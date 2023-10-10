import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { observer } from 'mobx-react-lite';
import { darken, lighten } from 'polished';
import { MouseEvent } from 'react';

import { useStores } from 'stores';
import { DocSetStore } from 'stores/DocSetStore';

import { RenderItemProps } from 'components/List';
import { Typography } from 'components/Typography';
import { DotsSpinnerIcon } from 'components/icons/DotsSpinnerIcon';

import { EditDocSetAliasInput } from './EditDocSetAliasInput';

const DocSetListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  padding-left: 8px;
  padding-right: 12px;

  > .body:first-of-type {
    flex-grow: 1;
  }

  &:hover {
    background-color: ${({ theme }) =>
      darken(0.2, theme.palette.secondary.main)};
  }

  ${({ selected, theme }) => {
    if (selected) {
      return `
        p:first-of-type {
          color: ${darken(0.6, theme.palette.text.primary)} !important;
          font-weight: 600 !important;
        }
        background-color: ${theme.palette.secondary.main};
        
        :hover {
          p:first-of-type {
            color: ${darken(0.2, theme.palette.text.primary)} !important;
          }
        }
      `;
    }
  }}
`;

const ActionsColumn = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 100px;
  border-left: 1px dotted
    ${({ theme }) => lighten(0.05, theme.palette.background.default)};
`;

export interface InstalledDocSetsItemProps extends RenderItemProps {
  docSet: DocSetStore;
}

export const InstalledDocSetsItem = observer(
  ({ docSet, ...props }: InstalledDocSetsItemProps) => {
    const { docSetFeedStore, docSetListStore, docSetManagerStore } =
      useStores();

    const handleClickReindex =
      (name: string) => async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const docSet = docSetListStore.docSets[name];
        await docSetManagerStore.reIndexDocSet(docSet.feedEntryName);
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

    const showUpateProgress =
      docSet.feedEntryName in docSetManagerStore.docSetDownloadProgress;
    const showRefreshIndexIcon = !showUpateProgress;
    const showUpdateIconButton = docSet.updatable && !showUpateProgress;
    const showDeleteIconButton = !showUpateProgress;

    return (
      <DocSetListItem {...props}>
        <Typography variant="body">{docSet.title}</Typography>
        <EditDocSetAliasInput name={docSet.name} selected={props.selected} />
        <ActionsColumn>
          {showRefreshIndexIcon && (
            <Tooltip
              title={
                <>
                  Re-index the <b>"{docSet.title}"</b> DocSet.
                </>
              }
              placement="left"
            >
              <IconButton
                onClick={handleClickReindex(docSet.name)}
                size="small"
              >
                <SyncIcon sx={{ color: 'text.primary' }} />
              </IconButton>
            </Tooltip>
          )}
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
              <IconButton onClick={handleClickUpdate(docSet.name)} size="small">
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
              <IconButton onClick={handleClickDelete(docSet.name)} size="small">
                <CloseIcon sx={{ color: 'red' }} />
              </IconButton>
            </Tooltip>
          )}
        </ActionsColumn>
      </DocSetListItem>
    );
  },
);
