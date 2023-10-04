import { ReactNode } from 'react';
import { darken } from 'polished';
import styled from '@emotion/styled';

interface StyledListItemProps {
  selected?: boolean;
}

const StyledListItem = styled.div<StyledListItemProps>`
  display: flex;
  align-items: center;
  padding: 4px;
  min-height: 24px;
  max-height: 24px;

  &:hover {
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

export interface SearchResultItemProps {
  children: ReactNode;
  'data-id': string;
  selected?: boolean;
}

export const SearchResultItem = ({
  children,
  selected,
  ...otherProps
}: SearchResultItemProps) => {
  return (
    <StyledListItem selected={selected} {...otherProps}>
      {children}
    </StyledListItem>
  );
};
