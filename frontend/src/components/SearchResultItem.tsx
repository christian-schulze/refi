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

export interface SearchResultItemProps {
  children: ReactNode;
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
