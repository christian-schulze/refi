import { useTheme as styledComponentsUseTheme } from 'styled-components';
import { baseDarkTheme } from './darkTheme';

export const useTheme = () => {
  return styledComponentsUseTheme() as typeof baseDarkTheme;
};
