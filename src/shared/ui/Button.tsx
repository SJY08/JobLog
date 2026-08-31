import React from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-white border border-primary hover:bg-primaryHover hover:border-primaryHover disabled:bg-primary/40 disabled:border-transparent',
  outline: 'bg-surface text-ink border border-line hover:bg-hover disabled:text-mute',
  ghost: 'bg-transparent text-graphite border border-transparent hover:bg-hover',
  danger: 'bg-surface text-danger border border-line hover:bg-hover'
};

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
  const sizing = size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-10 px-4 text-sm';
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed ${sizing} ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
