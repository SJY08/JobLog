import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'default' | 'danger';
  label: string;
  size?: 'sm' | 'md';
}

/**
 * @description 아이콘 버튼 컴포넌트
 */
export function IconButton({
  tone = 'default',
  size = 'md',
  label,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  const toneClass = tone === 'danger' ? 'text-mute hover:text-danger' : 'text-mute hover:text-ink';
  const sizing = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-150 ease-out hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40 ${sizing} ${toneClass} ${className}`}
      {...rest}
    />
  );
}
