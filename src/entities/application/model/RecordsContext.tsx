import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CoverLetter, CoverLetterSection } from '@/entities/cover-letter';
import { SEED_COVER_LETTER } from '@/entities/cover-letter';
import type { StoredFile } from '@/entities/file';
import { today, uid } from '@/shared/lib';
import { SEED_APPLICATIONS } from './seed';
import type { Application } from './types';

const APP_KEY = 'joblog-applications';
const CL_KEY = 'joblog-cover-letter';

/**
 * @description 빈 지원 기록을 만드는 함수
 */
export function emptyApplication(): Application {
  return {
    id: '',
    platform: '',
    company: '',
    region: null,
    position: '',
    appliedAt: today(),
    viewed: false,
    viewedAt: null,
    postingStatus: '진행중',
    applyStatus: '지원완료',
    link: '',
    memo: '',
    updatedAt: today()
  };
}

interface RecordsValue {
  applications: Application[];
  getApplication: (id: string) => Application | undefined;
  createApplication: (data: Application) => string;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  removeApplications: (ids: string[]) => void;

  files: StoredFile[];
  addFiles: (kind: StoredFile['kind'], list: File[]) => void;
  updateFile: (id: string, patch: Partial<StoredFile>) => void;
  removeFile: (id: string) => void;

  coverLetter: CoverLetter;
  updateCoverLetter: (patch: Partial<Omit<CoverLetter, 'sections'>>) => void;
  updateSection: (id: string, patch: Partial<CoverLetterSection>) => void;
  addSection: (title?: string) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
  saveCoverLetter: () => void;
}

const RecordsContext = createContext<RecordsValue | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * @description 지원 기록 프로바이더 컴포넌트
 */
export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(() => load(APP_KEY, SEED_APPLICATIONS));
  const [coverLetter, setCoverLetter] = useState<CoverLetter>(() => load(CL_KEY, SEED_COVER_LETTER));
  const [files, setFiles] = useState<StoredFile[]>([]);

  useEffect(() => persist(APP_KEY, applications), [applications]);

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications]
  );

  const createApplication = useCallback((data: Application) => {
    const id = uid('a');
    setApplications((prev) => [{ ...data, id, updatedAt: today() }, ...prev]);
    return id;
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: today() } : a)));
  }, []);

  const removeApplications = useCallback((ids: string[]) => {
    setApplications((prev) => prev.filter((a) => !ids.includes(a.id)));
  }, []);

  const addFiles = useCallback((kind: StoredFile['kind'], list: File[]) => {
    const mapped: StoredFile[] = list.map((f) => ({
      id: uid('f'),
      kind,
      label: f.name.replace(/\.[^.]+$/, ''),
      fileName: f.name,
      mimeType: f.type || 'application/octet-stream',
      size: f.size,
      uploadedAt: today(),
      url: URL.createObjectURL(f)
    }));
    setFiles((prev) => [...mapped, ...prev]);
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<StoredFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateCoverLetter = useCallback((patch: Partial<Omit<CoverLetter, 'sections'>>) => {
    setCoverLetter((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSection = useCallback((id: string, patch: Partial<CoverLetterSection>) => {
    setCoverLetter((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s))
    }));
  }, []);

  const addSection = useCallback((title = '') => {
    setCoverLetter((prev) => ({
      ...prev,
      sections: [...prev.sections, { id: uid('s'), title, body: '' }]
    }));
  }, []);

  const removeSection = useCallback((id: string) => {
    setCoverLetter((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id || s.locked)
    }));
  }, []);

  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    setCoverLetter((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      const [item] = sections.splice(idx, 1);
      sections.splice(next, 0, item);
      return { ...prev, sections };
    });
  }, []);

  const saveCoverLetter = useCallback(() => {
    setCoverLetter((prev) => {
      const next = { ...prev, updatedAt: today() };
      persist(CL_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      applications,
      getApplication,
      createApplication,
      updateApplication,
      removeApplications,
      files,
      addFiles,
      updateFile,
      removeFile,
      coverLetter,
      updateCoverLetter,
      updateSection,
      addSection,
      removeSection,
      moveSection,
      saveCoverLetter
    }),
    [
      applications,
      getApplication,
      createApplication,
      updateApplication,
      removeApplications,
      files,
      addFiles,
      updateFile,
      removeFile,
      coverLetter,
      updateCoverLetter,
      updateSection,
      addSection,
      removeSection,
      moveSection,
      saveCoverLetter
    ]
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

/**
 * @description 지원 기록 상태를 읽는 훅
 */
export function useRecords(): RecordsValue {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be used inside RecordsProvider');
  return ctx;
}
