import { useMemo } from 'react';
import styled from '@emotion/styled';

import { SettingsItem, SettingsItems } from 'stores/SettingsStore';

import { Typography } from 'components/Typography';
import { List, ListProps } from 'components/List';

const StyledList = styled(List)`
  height: 100%;
  background-color: ${({ theme }) => theme.palette.background.default};
  border: 1px solid transparent;
  border-radius: 4px;
  margin-right: 2px;

  :focus {
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }
` as typeof List;

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
  onSelect: ListProps<SettingsItem>['onSelect'];
  selectedSettingsId: string;
}

export const SettingsList = ({
  onSelect,
  selectedSettingsId,
}: SettingsListProps) => {
  const selectedSettingsItem = useMemo(() => {
    return SettingsItems.find((item) => item.id === selectedSettingsId);
  }, [selectedSettingsId]);

  return (
    <StyledList
      items={SettingsItems}
      itemSize={24}
      onSelect={onSelect}
      renderItem={({ id, label }, props) => {
        return (
          <ListItem key={id} {...props}>
            <Typography variant="body">{label}</Typography>
          </ListItem>
        );
      }}
      selectedItem={selectedSettingsItem}
      tabIndex={0}
    />
  );
};
