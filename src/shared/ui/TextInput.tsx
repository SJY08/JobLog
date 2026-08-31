import React from 'react';

export const inputClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-mute/70 transition-colors duration-150 ease-out hover:bg-hover focus:bg-surface focus:border-primary focus:outline-none';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * @description 텍스트 입력 컴포넌트
 */
export function TextInput({ className = '', invalid = false, ...rest }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${inputClass} ${invalid ? 'border-danger' : ''} ${className}`}
      {...rest}
    />
  );
}
