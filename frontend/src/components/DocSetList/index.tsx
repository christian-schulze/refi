import { observer } from 'mobx-react-lite';
import { darken } from 'polished';
import styled from '@emotion/styled';

import { useStores } from 'stores';
import { useTheme } from 'themes/utils';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';
import { Spinner } from 'components/Spinner';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ListWrapper = styled(List)`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.palette.background.default};
  border: 1px solid transparent;
  border-radius: 4px;

  :focus {
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }
`;

const ListItemWrapper = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  height: 24px;
  padding-left: 4px;
  padding-right: 4px;

  :hover {
    background-color: ${({ theme }) =>
      darken(0.2, theme.palette.secondary.main)};
  }

  ${({ selected, theme }) => {
    if (selected) {
      return `
        p {
          color: ${theme.palette.text.primary};
          font-weight: 500;
        }
        background-color: ${theme.palette.secondary.main};
      `;
    }
  }}
`;

const Icon = styled.img`
  margin-right: 6px;
  width: 16px;
  height: 16px;
`;

const SpinnerWrapper = styled(Spinner)`
  position: absolute;
  top: calc(50%);
  left: calc(50%);
  transform: translate(-50%, -50%);
`;

export const DocSetList = observer(() => {
  const theme = useTheme();
  const { docSetListStore, docSetAliasStore, tabsStore } = useStores();

  const handleSelect: ListProps['onSelect'] = (name, _cause) => {
    const selectedDocSet = docSetListStore.docSets[name];
    if (tabsStore.currentTab) {
      tabsStore.updateTabById(tabsStore.currentTab.id, selectedDocSet);
      tabsStore.selectTab(selectedDocSet.name);
    } else {
      tabsStore.addTab(selectedDocSet);
      tabsStore.selectTab(selectedDocSet.name);
    }
  };

  const selectedId =
    tabsStore.currentTab && !tabsStore.currentTab.docSetDetached
      ? tabsStore.currentTab.docSet?.name
      : undefined;

  return (
    <Container>
      <ListWrapper
        autoSelectOnFocus={false}
        items={Object.keys(docSetListStore.docSets).map((name) => {
          const docSet = docSetListStore.docSets[name];
          return (
            <ListItemWrapper data-id={name} key={name}>
              <Icon src={docSet.iconPath} alt={`${docSet.title} docset icon`} />
              <Typography variant="body">{docSet.title}</Typography>
              {docSetAliasStore.aliases[docSet.name] ? (
                <Typography
                  color={theme.palette.text.disabled}
                  fontWeight="bolder"
                  variant="body"
                >
                  &nbsp;({docSetAliasStore.aliases[docSet.name]}:)
                </Typography>
              ) : null}
            </ListItemWrapper>
          );
        })}
        itemSize={24}
        onSelect={handleSelect}
        selectedId={selectedId}
        tabIndex={0}
      />
      {docSetListStore.loading ? (
        <SpinnerWrapper length={12} size={64} width={2} />
      ) : null}
    </Container>
  );
});
