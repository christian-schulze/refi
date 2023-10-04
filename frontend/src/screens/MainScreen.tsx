import { Resizable } from 're-resizable';
import styled from '@emotion/styled';

import { DocSetList } from 'components/DocSetList';
import { DocSetsContentPanel } from 'components/DocSetsContentPanel';

const Container = styled.div`
  flex-grow: 1;
  display: flex;
`;

// @ts-expect-error
const ResizableWrapper = styled(Resizable)`
  border-right: 4px ridge ${({ theme }) => theme.palette.divider};
`;

export const MainScreen = () => {
  return (
    <Container>
      <ResizableWrapper enable={{ right: true }} minWidth={250}>
        <DocSetList />
      </ResizableWrapper>
      <DocSetsContentPanel />
    </Container>
  );
};
