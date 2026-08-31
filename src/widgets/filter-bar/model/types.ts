import type { ApplyStatus, Platform, PostingStatus } from '@/entities/application';

export interface Filters {
  keyword: string;
  platform: Platform | 'all';
  posting: PostingStatus | 'all';
  apply: ApplyStatus | 'all';
  viewed: 'all' | 'viewed' | 'unviewed';
  sido: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: Filters = {
  keyword: '',
  platform: 'all',
  posting: 'all',
  apply: 'all',
  viewed: 'all',
  sido: 'all',
  from: '',
  to: ''
};
