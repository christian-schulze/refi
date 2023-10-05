import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';

import { useStores } from 'stores';

import { Typography } from 'components/Typography';
import { InstalledDocSetList } from './InstalledDocSetList';
import { AvailableDocSetList } from './AvailableDocSetList';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Oct',
  'Nov',
  'Dec',
];

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
  padding-left: 8px;
  padding-right: 8px;
`;

const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatTime = (date: Date) => {
  const hour = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minutes}`;
};

export const DocSets = observer(() => {
  const { docSetFeedStore } = useStores();

  const renderDownloadedTimestamp = () => {
    if (docSetFeedStore.loadingDocSetFeedDownloadedTimestamp) {
      return 'Available docset list loading...';
    }

    if (docSetFeedStore.downloadingDocSetFeed) {
      return 'Available docset list downloading...';
    }

    if (docSetFeedStore.loadingDocSetFeed) {
      return 'Available docset list loading...';
    }

    if (docSetFeedStore.docSetFeedDownloadedTimestamp) {
      const downloadedDate = new Date(
        docSetFeedStore.docSetFeedDownloadedTimestamp,
      );
      return `Available docset list last downloaded on ${formatDate(
        downloadedDate,
      )} ${formatTime(downloadedDate)}`;
    }

    return 'Available docset list has not been downloaded yet.';
  };

  return (
    <Container>
      <Typography variant='subtitle1'>Installed docsets</Typography>
      <InstalledDocSetList />
      <Typography variant='subtitle1'>Available docsets</Typography>
      <AvailableDocSetList />
      <Typography variant='overline'>{renderDownloadedTimestamp()}</Typography>
    </Container>
  );
});
