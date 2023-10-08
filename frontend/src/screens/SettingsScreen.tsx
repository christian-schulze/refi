import { MouseEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router';
import { Resizable } from 're-resizable';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';

import { useStores } from 'stores';
import { SettingsItem } from 'stores/SettingsStore';

import { SettingsList } from 'components/Settings/SettingsList';
import { GeneralSettingsPanel } from 'components/Settings/GeneralSettingsPanel';
import { DocSets } from 'components/Settings/DocSets';
import { ListProps } from 'components/List';

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
  justify-content: flex-end;
  padding: 8px;
`;

export const SettingsScreen = observer(() => {
  const { settingsStore, docSetAliasStore } = useStores();
  const navigate = useNavigate();

  const handleSelect: ListProps<SettingsItem>['onSelect'] = (item) => {
    settingsStore.setSelectedSettingsId(item.id);
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
