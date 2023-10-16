import Close from '@mui/icons-material/Close';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface CloseIconProps extends SvgIconProps {}

export const CloseIcon = (props: CloseIconProps) => {
  return <Close {...props} />;
};
