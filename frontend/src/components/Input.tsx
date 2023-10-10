import { Theme } from '@mui/material';
import MUIInput from '@mui/material/Input';
import { SxProps } from '@mui/system';
import {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
  Ref,
} from 'react';

export interface InputProps {
  className?: string;
  disableUnderline?: boolean;
  endAdornment?: ReactNode;
  fullWidth?: boolean;
  inputRef?: Ref<any>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  startAdornment?: ReactNode;
  sx?: SxProps<Theme>;
  value?: unknown;
}

export const Input = (props: InputProps) => {
  return <MUIInput {...props} />;
};
