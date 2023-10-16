import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { Resizable } from 're-resizable';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { BrowserOpenURL } from '../../wailsjs/runtime';

import { useStores } from 'stores';
import { SettingsItem } from 'stores/SettingsStore';

import { Button } from 'components/Button';
import { ListProps } from 'components/List';
import { DocSets } from 'components/Settings/DocSetsPanel';
import { GeneralSettingsPanel } from 'components/Settings/GeneralSettingsPanel';
import { SettingsList } from 'components/Settings/SettingsList';
import { Typography } from 'components/Typography';

const Container = styled.div`
  flex-grow: 1;
  display: flex;
`;

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

// @ts-expect-error
const ResizableWrapper = styled(Resizable)`
  border-right: 4px ridge ${({ theme }) => theme.palette.divider};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
`;

const AcknowledgementLink = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.palette.secondary.main};
`;

export const SettingsScreen = observer(() => {
  const { settingsStore, docSetAliasStore } = useStores();
  const navigate = useNavigate();

  const handleSelect: ListProps<SettingsItem>['onSelect'] = (item) => {
    settingsStore.setSelectedSettingsId(item.id);
  };

  const handleClickAcknowledgementLink = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    BrowserOpenURL('https://kapeli.com/dash');
  };

  const handleClickClose = (_event: MouseEvent<HTMLButtonElement>) => {
    if (docSetAliasStore.isDirty) {
      docSetAliasStore.saveAliases();
    }
    navigate('/');
  };

  return (
    <Container>
      <ResizableWrapper enable={{ right: true }} minWidth={250}>
        <SettingsList
          onSelect={handleSelect}
          selectedSettingsId={settingsStore.selectedSettingsId}
        />
      </ResizableWrapper>
      <Content>
        {settingsStore.selectedSettingsId === 'settings-list-item-general' ? (
          <GeneralSettingsPanel />
        ) : null}
        {settingsStore.selectedSettingsId === 'settings-list-item-docsets' ? (
          <DocSets />
        ) : null}
        <Footer>
          <AcknowledgementLink
            href="https://kapeli.com/dash"
            onClick={handleClickAcknowledgementLink}
          >
            <Typography variant="subtitle2">
              Docsets provided by Dash
            </Typography>
          </AcknowledgementLink>
          <Button
            color="secondary"
            onClick={handleClickClose}
            sx={{ backgroundColor: 'background.paper' }}
          >
            Close
          </Button>
        </Footer>
      </Content>
    </Container>
  );
});
