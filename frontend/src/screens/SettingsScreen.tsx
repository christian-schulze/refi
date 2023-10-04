import { MouseEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router';
import { Resizable } from 're-resizable';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';

import { useStore } from 'stores';

import { SettingsList } from 'components/Settings/SettingsList';
import { GeneralSettingsPanel } from 'components/Settings/GeneralSettingsPanel';
import { DocSets } from 'components/Settings/DocSets';

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
  const settingsStore = useStore('settings');
  const docSetAliasStore = useStore('docSetAliases');
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!settingsStore.selectedSectionId) {
  //     settingsStore.setSelectedSectionId('settings-list-item-general');
  //   }
  // }, []);

  const handleSelect = (id: string) => {
    settingsStore.setSelectedSectionId(id);
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
          selectedId={settingsStore.selectedSectionId}
        />
      </ResizableWrapper>
      <Content>
        {settingsStore.selectedSectionId === 'settings-list-item-general' ? (
          <GeneralSettingsPanel />
        ) : null}
        {settingsStore.selectedSectionId === 'settings-list-item-docsets' ? (
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
