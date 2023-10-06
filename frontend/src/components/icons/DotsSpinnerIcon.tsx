import { cx, css } from '@emotion/css';

const iconClassName = css`
  stroke: currentColor;

  .spinner_first {
    animation: spinner_animation 0.8s linear infinite;
    animation-delay: -0.8s;
  }

  .spinner_second {
    animation-delay: -0.65s;
  }

  .spinner_third {
    animation-delay: -0.5s;
  }

  @keyframes spinner_animation {
    93.75%,
    100% {
      opacity: 0.2;
    }
  }
`;

export interface DotsSpinnerIconProps {
  className?: string;
}

export const DotsSpinnerIcon = ({ className }: DotsSpinnerIconProps) => {
  return (
    <svg
      className={cx(iconClassName, className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="spinner_first" cx="4" cy="12" r="3" />
      <circle className="spinner_first spinner_second" cx="12" cy="12" r="3" />
      <circle className="spinner_first spinner_third" cx="20" cy="12" r="3" />
    </svg>
  );
};
