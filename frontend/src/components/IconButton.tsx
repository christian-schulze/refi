import MUIIconButton, {
  IconButtonProps as MUIIconButtonProps,
} from '@mui/material/IconButton';

export interface IconButtonProps extends MUIIconButtonProps {}

export const IconButton = (props: IconButtonProps) => {
  return <MUIIconButton {...props} />;
};
