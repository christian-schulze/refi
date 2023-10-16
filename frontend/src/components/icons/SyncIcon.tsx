import Sync from '@mui/icons-material/Sync';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SyncIconProps extends SvgIconProps {}

export const SyncIcon = (props: SyncIconProps) => {
  return <Sync {...props} />;
};
