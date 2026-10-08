import React from 'react';
import { buttonClass, type ButtonVariant } from './buttonClass';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

/**
 * @description 버튼 컴포넌트
 */
export function Button({
  variant = 'outline',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...rest} />;
}
