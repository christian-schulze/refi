import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { darken } from 'polished';

import { useStores } from 'stores';
import { DocSetStore } from 'stores/DocSetStore';
import { useTheme } from 'themes/utils';

import { List, ListProps } from 'components/List';
import { Spinner } from 'components/Spinner';
import { Typography } from 'components/Typography';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

// @emotion styled components don't support generic prop types,
// we work around this by type casting to the wrapped component type.
// More details about the issue here:
// https://github.com/emotion-js/emotion/issues/2342
const StyledList = styled(List)`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.palette.background.default};
  border: 1px solid transparent;
  border-radius: 4px;
  margin-right: 3px;

  :focus {
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }
` as typeof List;

const StyledListItem = styled.div<{ selected?: boolean }>`
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
        p:first-of-type {
          color: ${darken(0.6, theme.palette.text.primary)} !important;
          font-weight: 600 !important;
        }
        p:nth-of-type(2) {
          color: ${darken(0.5, theme.palette.text.primary)} !important;
          font-weight: 600 !important;
        }
        background-color: ${theme.palette.secondary.main};
        
        :hover {
          p:first-of-type {
            color: ${darken(0.2, theme.palette.text.primary)} !important;
          }
          p:nth-of-type(2) {
            color: ${darken(0.3, theme.palette.text.primary)} !important;
          }
        }
      `;
    }
  }}
`;

const Icon = styled.img`
  margin-right: 6px;
  width: 16px;
  height: 16px;
`;

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: calc(50%);
  left: calc(50%);
  transform: translate(-50%, -50%);
`;

export const DocSetList = observer(() => {
  const theme = useTheme();
  const { docSetListStore, docSetAliasStore, tabsStore } = useStores();

  const handleSelect: ListProps<DocSetStore>['onSelect'] = (
    selectedDocSet,
    _cause,
  ) => {
    if (tabsStore.currentTab) {
      tabsStore.updateTabById(tabsStore.currentTab.id, selectedDocSet);
      tabsStore.selectTab(selectedDocSet.name);
    } else {
      tabsStore.addTab(selectedDocSet);
      tabsStore.selectTab(selectedDocSet.name);
    }
  };

  const selectedDocSet =
    tabsStore.currentTab && !tabsStore.currentTab.docSetDetached
      ? tabsStore.currentTab.docSet
      : undefined;

  return (
    <Container>
      <StyledList<DocSetStore>
        autoSelectOnFocus={false}
        items={Object.values(docSetListStore.docSets)}
        itemSize={24}
        onSelect={handleSelect}
        renderItem={(docSet, props) => {
          return (
            <StyledListItem key={docSet.name} {...props}>
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
            </StyledListItem>
          );
        }}
        selectedItem={selectedDocSet}
        tabIndex={0}
      />
      {docSetListStore.loading ? (
        <StyledSpinner length={12} size={64} width={2} />
      ) : null}
    </Container>
  );
});
