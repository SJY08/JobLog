export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white border border-primary hover:bg-primary-hover hover:border-primary-hover disabled:bg-primary/40 disabled:border-transparent',
  outline: 'bg-surface text-ink border border-line hover:bg-hover disabled:text-mute',
  ghost: 'bg-transparent text-graphite border border-transparent hover:bg-hover',
  danger: 'bg-surface text-danger border border-line hover:bg-hover'
};

/**
 * @description 버튼 모양 클래스를 만드는 함수 (링크를 버튼처럼 보일 때 사용)
 */
export function buttonClass(variant: ButtonVariant = 'outline', size: 'sm' | 'md' = 'md'): string {
  const sizing = size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-10 px-4 text-sm';
  return `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed ${sizing} ${VARIANTS[variant]}`;
}
