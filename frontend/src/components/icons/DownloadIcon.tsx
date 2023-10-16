import Download from '@mui/icons-material/Downloading';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface DownloadIconProps extends SvgIconProps {}

export const DownloadIcon = (props: DownloadIconProps) => {
  return <Download {...props} />;
};
