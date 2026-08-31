import type { CoverLetter } from './types';

export const DEFAULT_SECTION_TITLES = ['성장과정', '성격의 장단점', '학교생활', '지원동기 및 입사 후 포부'];

export const SEED_COVER_LETTER: CoverLetter = {
  applicantName: '',
  targetCompany: '',
  targetPosition: '',
  sections: DEFAULT_SECTION_TITLES.map((title, i) => ({
    id: `s-${i + 1}`,
    title,
    body: '',
    locked: true
  })),
  updatedAt: ''
};
