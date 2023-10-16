import Settings from '@mui/icons-material/Settings';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SettingsIconProps extends SvgIconProps {}

export const SettingsIcon = (props: SettingsIconProps) => {
  return <Settings {...props} />;
};
