import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
  invalid?: boolean;
}

/**
 * @description 셀렉트 입력 컴포넌트
 */
export function SelectInput({
  className = '',
  compact = false,
  invalid = false,
  ...rest
}: SelectInputProps) {
  return (
    <span className="relative inline-flex w-full items-center">
      <select
        aria-invalid={invalid || undefined}
        className={`w-full cursor-pointer appearance-none rounded-md border bg-surface pr-8 text-ink transition-colors duration-150 ease-out hover:bg-hover focus:border-primary focus:outline-none ${
          invalid ? 'border-danger' : 'border-line'
        } ${compact ? 'h-10 pl-3 text-[13px]' : 'h-11 pl-3 text-sm'} ${className}`}
        {...rest}
      />
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 h-4 w-4 text-mute" aria-hidden="true" />
    </span>
  );
}
