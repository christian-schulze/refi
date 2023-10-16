import styled from '@emotion/styled';
import { lighten } from 'polished';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { IconButton } from 'components/IconButton';
import { SettingsIcon } from 'components/icons';

import { SearchField } from './SearchField';

const Container = styled.div`
  min-height: 34px;
  user-select: none;
  display: flex;
  align-items: center;
  z-index: 1;
  ${({ theme }) => {
    const background = theme.palette.background.default;
    return `background: linear-gradient(${lighten(
      0.05,
      background,
    )}, ${background})`;
  }}
`;

export const TitleBar = () => {
  const navigate = useNavigate();

  const handleClickSettings = (_event: MouseEvent<HTMLButtonElement>) => {
    navigate('/settings');
  };

  return (
    <Container data-tauri-drag-region>
      {window.location.pathname === '/' ? (
        <>
          <div style={{ width: '84px' }} />
          <div style={{ flexGrow: '1' }} />
          <SearchField />
          <IconButton color="secondary" onClick={handleClickSettings}>
            <SettingsIcon />
          </IconButton>
        </>
      ) : null}
      <div style={{ flexGrow: '1' }} />
    </Container>
  );
};
