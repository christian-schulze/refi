import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';

import { useStore } from 'stores';
import { Header, HeaderProps } from './Header';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: white;
`;

const IFrame = styled.iframe`
  flex-grow: 1;
  border: none;
`;

export const DocSetsContentPanel = observer(() => {
  const tabsStore = useStore('tabs');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleClickBack: HeaderProps['onClickBack'] = (_event) => {
    iframeRef.current?.contentWindow?.history.back();
  };

  const handleClickForward: HeaderProps['onClickForward'] = (_event) => {
    iframeRef.current?.contentWindow?.history.forward();
  };

  return (
    <Container>
      <Header
        onClickBack={handleClickBack}
        onClickForward={handleClickForward}
      />
      <IFrame ref={iframeRef} src={tabsStore.currentTab?.currentUrl || ''} />
    </Container>
  );
});
