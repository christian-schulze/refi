import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { Outlet } from 'react-router';
import styled from '@emotion/styled';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { checkForUpdatableDocSets } from 'services/docSetUpdater';
import { useStores } from 'stores';

import { TitleBar } from 'components/TitleBar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ theme }) => theme.palette.background.default};
  border: 3px dotted ${({ theme }) => theme.palette.background.default};
`;

export const Root = observer(() => {
  const {
    docSetAliasStore,
    docSetFeedStore,
    docSetListStore,
    errorsStore,
    settingsStore,
  } = useStores();

  useEffect(() => {
    (async () => {
      await settingsStore.loadSettings();
      await docSetListStore.loadDocSets();
      await docSetAliasStore.loadAliases();
      docSetFeedStore.loadDocSetFeed();
    })();
  }, []);

  useEffect(() => {
    return reaction(
      () => docSetFeedStore.state,
      (state, prev) => {
      if (state === 'inactive' && prev !== 'inactive') {
        checkForUpdatableDocSets(docSetListStore, docSetFeedStore);
      }
    });
  }, []);

  const handleCloseSnackbar = () => {
    errorsStore.flagErrorAsShown();
  };

  return (
    <Container>
      <TitleBar />
      <Outlet />
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        onClose={handleCloseSnackbar}
        open={!!errorsStore.currentError}
      >
        <Alert
          elevation={6}
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
        >
          {errorsStore.currentError?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
});
