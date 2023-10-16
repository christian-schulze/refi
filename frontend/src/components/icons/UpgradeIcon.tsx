import Upgrade from '@mui/icons-material/Upgrade';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface UpgradeIconProps extends SvgIconProps {}

export const UpgradeIcon = (props: UpgradeIconProps) => {
  return <Upgrade {...props} />;
};
