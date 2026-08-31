import type { ApplyStatus, Platform, PostingStatus } from './types';

export const PLATFORMS: { value: Platform; label: string; dot: string }[] = [
  { value: 'jobkorea', label: '잡코리아', dot: '#2F6BE0' },
  { value: 'wanted', label: '원티드', dot: '#1E8E7E' },
  { value: 'rallit', label: '랠릿', dot: '#C2410C' },
  { value: 'etc', label: '그 외', dot: '#9CA3AF' }
];

export const PLATFORM_LABEL: Record<Platform, string> = {
  jobkorea: '잡코리아',
  wanted: '원티드',
  rallit: '랠릿',
  etc: '그 외'
};

export const PLATFORM_DOT: Record<Platform, string> = {
  jobkorea: '#2F6BE0',
  wanted: '#1E8E7E',
  rallit: '#C2410C',
  etc: '#9CA3AF'
};

export const POSTING_STATUSES: PostingStatus[] = ['진행중', '상시', '접수마감'];

export const POSTING_STYLE: Record<PostingStatus, string> = {
  진행중: 'text-primary',
  상시: 'text-graphite',
  접수마감: 'text-mute'
};

export const APPLY_STATUSES: ApplyStatus[] = ['지원완료', '서류합격', '서류탈락', '최종합격', '최종불합격'];

export const APPLY_STYLE: Record<ApplyStatus, string> = {
  지원완료: 'bg-lineSoft text-graphite border-transparent',
  서류합격: 'bg-primarySoft text-primary border-primary/25',
  서류탈락: 'bg-transparent text-mute border-line',
  최종합격: 'bg-success text-white border-transparent',
  최종불합격: 'bg-transparent text-danger border-danger/30'
};
