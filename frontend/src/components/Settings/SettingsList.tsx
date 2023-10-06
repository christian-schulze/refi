import { useRef } from 'react';
import styled from '@emotion/styled';

import { List, ListProps } from 'components/List';
import Typography from '@mui/material/Typography';

const ListWrapper = styled(List)`
  height: 100%;
  background-color: ${({ theme }) => theme.palette.background.default};
  border: 1px solid transparent;
  border-radius: 4px;
  margin-right: 2px;

  :focus {
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }
`;

const ListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  padding: 4px;

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

export interface SettingsListProps {
  onSelect: ListProps['onSelect'];
  selectedId: string;
}

export const SettingsList = ({ onSelect, selectedId }: SettingsListProps) => {
  const listRef = useRef(null);

  return (
    <ListWrapper
      items={[
        <ListItem
          data-id="settings-list-item-docsets"
          key="settings-list-item-docsets"
        >
          <Typography variant="body2">DocSets</Typography>
        </ListItem>,
        <ListItem
          data-id="settings-list-item-general"
          key="settings-list-item-general"
        >
          <Typography variant="body2">General</Typography>
        </ListItem>,
      ]}
      itemSize={24}
      onSelect={onSelect}
      ref={listRef}
      selectedId={selectedId}
      tabIndex={0}
    />
  );
};
