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
}

export const AvailableDocSetItem = observer(
  ({ name, ...props }: AvailableDocSetItemProps) => {
    const { docSetFeedStore, docSetManagerStore, docSetListStore } =
      useStores();

    const handleClickDownload =
      (name: string) => async (_event: MouseEvent<HTMLButtonElement>) => {
        const urls = docSetFeedStore.getDocSetUrls(name);
        const version = docSetFeedStore.getDocSetVersion(name);
        if (urls.length > 0) {
          await docSetManagerStore.installDocSet(urls[0], name, version);
          docSetListStore.loadDocSets();
        }
      };

    return (
      <DocSetListItem {...props}>
        <Typography variant="body">{name}</Typography>
        <ActionsColumn>
          {docSetManagerStore.docSetDownloadProgress[name] ? (
            <Chip
              color="success"
              icon={<DotsSpinnerIcon />}
              label={docSetManagerStore.docSetDownloadProgress[name] + '%'}
              size="small"
            />
          ) : (
            <Tooltip
              title={
                <>
                  Download the <b>"{name}"</b> DocSet.
                </>
              }
              placement="left"
            >
              <IconButton onClick={handleClickDownload(name)} size="small">
                <DownloadIcon sx={{ color: 'green' }} />
              </IconButton>
            </Tooltip>
          )}
        </ActionsColumn>
      </DocSetListItem>
    );
  },
);
