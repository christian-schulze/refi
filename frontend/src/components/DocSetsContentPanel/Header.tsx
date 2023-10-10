import styled from '@emotion/styled';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { observer } from 'mobx-react-lite';
import { MouseEvent, MouseEventHandler } from 'react';

import { useStores } from 'stores';

import { Typography } from 'components/Typography';

const Container = styled.div`
  display: flex;
  align-items: center;
  min-height: 40px;
  height: 40px;
  padding: 0 4px;
  background-color: ${({ theme }) => theme.palette.primary.main};
`;

const Tabs = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;
`;

const Tab = styled.div<{ selected: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  height: calc(100% - 4px);
  padding: 0 6px 0 8px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;

  :focus {
    outline: 1px solid ${({ theme }) => theme.palette.secondary.main};
  }

  ${({ selected, theme }) => {
    if (selected) {
      return `
        p {
          color: ${theme.palette.secondary.main};
        }
        background-color: ${theme.palette.background.paper};

        :after {
          content: '';
          position: absolute;
          top: 36px;
          left: 0px;
          width: 100%;
          height: 3px;
          background-color: ${theme.palette.secondary.main};
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
        }
      `;
    }
  }}
`;

const Icon = styled.img`
  margin-right: 10px;
  width: 16px;
  height: 16px;
`;

export interface HeaderProps {
  onClickBack: MouseEventHandler<HTMLButtonElement>;
  onClickForward: MouseEventHandler<HTMLButtonElement>;
}

export const Header = observer(
  ({ onClickBack, onClickForward }: HeaderProps) => {
    const { tabsStore } = useStores();

    const handleClickClose =
      (id: string) => (_event: MouseEvent<SVGSVGElement>) => {
        tabsStore.closeTabById(id);
      };

    return (
      <Container>
        <IconButton onClick={onClickBack}>
          <ArrowBackIcon color="secondary" />
        </IconButton>
        <IconButton onClick={onClickForward}>
          <ArrowForward color="secondary" />
        </IconButton>
        {tabsStore.currentTab ? (
          <Tabs>
            {tabsStore.tabs.map((tab) => {
              return (
                <Tab
                  key={tab.id}
                  selected={tabsStore.currentTab?.id === tab.id}
                  tabIndex={0}
                >
                  <Icon
                    src={tab.docSet?.iconPath || ''}
                    alt={`${tab.docSet?.title} docset icon`}
                  />
                  <Typography variant="body">{tab.docSet?.title}</Typography>
                  <CloseIcon
                    onClick={handleClickClose(tab.id)}
                    sx={{ color: 'background.default', marginLeft: '6px' }}
                  />
                </Tab>
              );
            })}
          </Tabs>
        ) : null}
      </Container>
    );
  },
);
