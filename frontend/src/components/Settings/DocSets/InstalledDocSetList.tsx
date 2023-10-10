import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { lighten } from 'polished';
import styled from '@emotion/styled';

import { useStores } from 'stores';
import { DocSetStore } from 'stores/DocSetStore';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';
import { InstalledDocSetsItem } from './InstalledDocSetsItem';

const StyledDocSetList = styled(List)`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;

  margin-top: 4px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid ${({theme}) => theme.palette.background.paper};
  background-color: ${({theme}) => theme.palette.background.paper};
  overflow-y: auto;

  :focus-within {
    border-color: ${({theme}) => theme.palette.secondary.main};
  }
` as typeof List;

const DocSetListHeader = styled.div`
  display: flex;
  padding-left: 8px;
  padding-right: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.background.paper};
  background-color: ${({ theme }) => theme.palette.background.default};

  > .subtitle2:nth-of-type(1) {
    flex-grow: 1;
    border-right: 1px dotted
      ${({ theme }) => lighten(0.05, theme.palette.background.default)};
  }

  > .subtitle2:nth-of-type(2) {
    min-width: 200px;
    max-width: 200px;
    padding-left: 6px;
  }
`;

const ActionsColumnHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 100px;
  border-left: 1px dotted ${({theme}) => lighten(0.05, theme.palette.background.default)};
`;

export const InstalledDocSetList = observer(() => {
  const { docSetListStore } = useStores();

  const [selectedDocSet, setSelectedDocSet] = useState<DocSetStore>();

  const handleSelect: ListProps<DocSetStore>['onSelect'] = (docSet) => {
    setSelectedDocSet(docSet);
  };

  return (
    <StyledDocSetList<DocSetStore>
      header={
        <DocSetListHeader>
          <Typography variant="subtitle2">Docset name</Typography>
          <Typography variant="subtitle2">Alias</Typography>
          <ActionsColumnHeader />
        </DocSetListHeader>
      }
      items={Object.values(docSetListStore.docSets)}
      itemSize={24}
      onSelect={handleSelect}
      renderItem={(docSet, props) => (
        <InstalledDocSetsItem docSet={docSet} {...props} />
      )}
      selectedItem={selectedDocSet}
      tabIndex={0}
    />
  );
});
