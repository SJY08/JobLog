import type { Region } from '@/entities/region';

export type Platform = 'jobkorea' | 'wanted' | 'rallit' | 'etc';

export type PlatformValue = Platform | '';

export type PostingStatus = '진행중' | '상시' | '접수마감';

export type ApplyStatus = '지원완료' | '서류합격' | '서류탈락' | '최종합격' | '최종불합격';

export interface Application {
  id: string;
  platform: PlatformValue;
  company: string;
  region: Region | null;
  position: string;
  appliedAt: string;
  viewed: boolean;
  viewedAt: string | null;
  postingStatus: PostingStatus;
  applyStatus: ApplyStatus;
  link: string;
  memo: string;
  updatedAt: string;
}
