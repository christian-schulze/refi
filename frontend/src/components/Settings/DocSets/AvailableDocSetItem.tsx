import styled from '@emotion/styled';
import DownloadIcon from '@mui/icons-material/Download';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { observer } from 'mobx-react-lite';
import { darken, lighten } from 'polished';
import { MouseEvent } from 'react';

import { useStores } from 'stores';

import { RenderItemProps } from 'components/List';
import { Typography } from 'components/Typography';
import { DotsSpinnerIcon } from 'components/icons/DotsSpinnerIcon';

const DocSetListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  padding-left: 8px;
  padding-right: 12px;

  > .body:nth-of-type(1) {
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

export interface AvailableDocSetItemProps extends RenderItemProps {
  name: string;
  onClickDownload: (name: string) => void;
}

export const AvailableDocSetItem = observer(
  ({ name, onClickDownload, ...props }: AvailableDocSetItemProps) => {
    const { docSetManagerStore } = useStores();

    const handleClickDownload = (_event: MouseEvent<HTMLButtonElement>) => {
      onClickDownload(name);
    };

    const renderProgressChip = () => {
      const installProgress = docSetManagerStore.docSetInstallProgress[name];
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

    return (
      <DocSetListItem {...props}>
        <Typography variant="body">{name}</Typography>
        <ActionsColumn>
          {docSetManagerStore.docSetInstallProgress[name] ? (
            renderProgressChip()
          ) : (
            <Tooltip
              title={
                <>
                  Download the <b>"{name}"</b> DocSet.
                </>
              }
              placement="left"
            >
              <IconButton onClick={handleClickDownload} size="small">
                <DownloadIcon sx={{ color: 'green' }} />
              </IconButton>
            </Tooltip>
          )}
        </ActionsColumn>
      </DocSetListItem>
    );
  },
);
