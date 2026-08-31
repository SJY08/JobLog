import React from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * @description 폼 필드 컴포넌트
 */
export function Field({
  label,
  hint,
  required = false,
  error,
  htmlFor,
  children,
  className = ''
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline gap-2 text-[13px] font-medium text-graphite">
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {hint && <span className="text-2xs font-normal text-mute">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-2xs text-danger">{error}</p>}
    </div>
  );
}
