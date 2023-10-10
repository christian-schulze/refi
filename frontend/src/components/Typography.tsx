import { cx } from '@emotion/css';
import styled from '@emotion/styled';
import { CSSProperties, ReactNode } from 'react';

export type Variants =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'subtitle1'
  | 'subtitle2'
  | 'body'
  | 'button'
  | 'caption'
  | 'overline';

export type TagVariants =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span';

const StyledTypography = styled.p`
  font-family: Roboto;
  font-style: normal;
  line-height: normal;

  margin: 0;

  &.heading1 {
    font-size: 96px;
    font-weight: 300;
    letter-spacing: -1.44px;
  }

  &.heading2 {
    font-size: 60px;
    font-weight: 300;
    letter-spacing: -0.3px;
  }

  &.heading3 {
    font-size: 48px;
    font-weight: 400;
  }

  &.subtitle1 {
    font-size: 34px;
    font-weight: 400;
    letter-spacing: 0.085px;
  }

  &.subtitle2 {
    font-size: 24px;
    font-weight: 500;
  }

  &.body {
    font-size: 16px;
    font-weight: 400;
  }

  &.button {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.175px;
    text-transform: uppercase;
  }

  &.caption {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.048px;
  }

  &.overline {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.18px;
    text-transform: uppercase;
  }
`;

export interface TypographyProps extends CSSProperties {
  className?: string;
  children: ReactNode;
  tag?: TagVariants;
  variant: Variants;
}

export const Typography = ({
  className,
  children,
  tag = 'p',
  variant,
  ...props
}: TypographyProps) => {
  return (
    <StyledTypography
      as={tag}
      className={cx(variant, className)}
      style={{ ...props }}
    >
      {children}
    </StyledTypography>
  );
};
