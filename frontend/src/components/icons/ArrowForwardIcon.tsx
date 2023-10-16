import ArrowForward from '@mui/icons-material/ArrowForward';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ArrowForwardIconProps extends SvgIconProps {}

export const ArrowForwardIcon = (props: ArrowForwardIconProps) => {
  return <ArrowForward {...props} />;
};
