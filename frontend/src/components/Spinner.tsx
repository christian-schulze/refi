import styled from '@emotion/styled';
import { CSSProperties } from 'react';

interface SpinnerWrapperProps {
  length: number;
  size: number;
  width: number;
}

const SpinnerWrapper = styled.div<SpinnerWrapperProps>`
  display: inline-block;
  position: relative;
  margin: 0 2px;

  div {
    animation: lds-spinner 1.2s linear infinite;
  }

  div:after {
    content: ' ';
    display: block;
    position: absolute;
    background: ${({ theme }) => theme.palette.secondary.main};
  }

  ${({ length, size, width }) => {
    return `
      width: ${size}px;
      height: ${size}px;
      
      div {
        transform-origin: ${size / 2}px ${size / 2}px;
      }
      
      div:after {
        top: 3px;
        left: ${size / 2 - width / 2}px;
        width: ${width}px;
        height: ${length}px;
        border-radius: 20%;
      }
    `;
  }}

  div:nth-of-type(1) {
    transform: rotate(0deg);
    animation-delay: -1.1s;
  }

  div:nth-of-type(2) {
    transform: rotate(30deg);
    animation-delay: -1s;
  }

  div:nth-of-type(3) {
    transform: rotate(60deg);
    animation-delay: -0.9s;
  }

  div:nth-of-type(4) {
    transform: rotate(90deg);
    animation-delay: -0.8s;
  }

  div:nth-of-type(5) {
    transform: rotate(120deg);
    animation-delay: -0.7s;
  }

  div:nth-of-type(6) {
    transform: rotate(150deg);
    animation-delay: -0.6s;
  }

  div:nth-of-type(7) {
    transform: rotate(180deg);
    animation-delay: -0.5s;
  }

  div:nth-of-type(8) {
    transform: rotate(210deg);
    animation-delay: -0.4s;
  }

  div:nth-of-type(9) {
    transform: rotate(240deg);
    animation-delay: -0.3s;
  }

  div:nth-of-type(10) {
    transform: rotate(270deg);
    animation-delay: -0.2s;
  }

  div:nth-of-type(11) {
    transform: rotate(300deg);
    animation-delay: -0.1s;
  }

  div:nth-of-type(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
  }

  @keyframes lds-spinner {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

export interface SpinnerProps {
  className?: string;
  length?: number;
  size?: number;
  style?: CSSProperties;
  width?: number;
}

export const Spinner = ({
  className,
  length = 6,
  size = 26,
  style,
  width = 1,
}: SpinnerProps) => {
  return (
    <SpinnerWrapper
      className={className}
      length={length}
      size={size}
      style={style}
      width={width}
    >
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </SpinnerWrapper>
  );
};
