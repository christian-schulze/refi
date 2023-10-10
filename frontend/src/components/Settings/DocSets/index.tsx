import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';

import { useStores } from 'stores';

import { Typography } from 'components/Typography';
import { AvailableDocSetList } from './AvailableDocSetList';
import { InstalledDocSetList } from './InstalledDocSetList';

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

const Heading = styled(Typography)`
  color: ${({ theme }) => theme.palette.secondary.main};
`;

const Timestamp = styled(Typography)`
  span {
    color: ${({ theme }) => theme.palette.text.hint};
  }
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
      return 'Preparing list of available docsets...';
    }

    if (docSetFeedStore.downloadingDocSetFeed) {
      return 'Downloading list of available docsets...';
    }

    if (docSetFeedStore.loadingDocSetFeed) {
      return 'Preparing list of available docsets...';
    }

    if (docSetFeedStore.docSetFeedDownloadedTimestamp) {
      const downloadedDate = new Date(
        docSetFeedStore.docSetFeedDownloadedTimestamp,
      );
      return (
        <>
          List of available docsets last downloaded on{' '}
          <Typography tag="span" variant="overline">
            {formatDate(downloadedDate)} {formatTime(downloadedDate)}
          </Typography>
        </>
      );
    }

    return 'List of available docsets has not been downloaded yet.';
  };

  return (
    <Container>
      <Heading variant="subtitle2">Installed docsets</Heading>
      <InstalledDocSetList />
      <Heading variant="subtitle2">Available docsets</Heading>
      <AvailableDocSetList />
      <Timestamp variant="overline">{renderDownloadedTimestamp()}</Timestamp>
    </Container>
  );
});
