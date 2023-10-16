import ArrowBack from '@mui/icons-material/ArrowBack';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ArrowBackIconProps extends SvgIconProps {}

export const ArrowBackIcon = (props: ArrowBackIconProps) => {
  return <ArrowBack {...props} />;
};
