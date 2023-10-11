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
  onClickDelete: (name: string) => void;
  onClickReIndex: (name: string) => void;
  onClickUpdate: (name: string) => void;
}

export const InstalledDocSetsItem = observer(
  ({
    docSet,
    onClickDelete,
    onClickReIndex,
    onClickUpdate,
    ...props
  }: InstalledDocSetsItemProps) => {
    const { docSetManagerStore } = useStores();

    const handleClickReindex = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onClickReIndex(docSet.name);
    };

    const handleClickUpdate = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onClickUpdate(docSet.name);
    };

    const handleClickDelete = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onClickDelete(docSet.name);
    };

    const renderProgressChip = () => {
      const installProgress =
        docSetManagerStore.docSetInstallProgress[docSet.feedEntryName];
      const progress =
        installProgress.status === 'Downloading' ? (
          <>&nbsp;{installProgress.progress}%</>
        ) : (
          ''
        );

      return (
        <Chip
          color="success"
          label={
            <>
              <span>
                {installProgress.status}
                {progress}
              </span>
              &nbsp;
              <DotsSpinnerIcon />
            </>
          }
          size="small"
          sx={{
            '.MuiChip-label': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        />
      );
    };

    const showUpateProgress =
      docSet.feedEntryName in docSetManagerStore.docSetInstallProgress;
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
              <IconButton onClick={handleClickReindex} size="small">
                <SyncIcon sx={{ color: 'text.primary' }} />
              </IconButton>
            </Tooltip>
          )}
          {showUpateProgress && renderProgressChip()}
          {showUpdateIconButton && (
            <Tooltip
              title={
                <>
                  Update the <b>"{docSet.title}"</b> DocSet.
                </>
              }
              placement="left"
            >
              <IconButton onClick={handleClickUpdate} size="small">
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
              <IconButton onClick={handleClickDelete} size="small">
                <CloseIcon sx={{ color: 'red' }} />
              </IconButton>
            </Tooltip>
          )}
        </ActionsColumn>
      </DocSetListItem>
    );
  },
);
