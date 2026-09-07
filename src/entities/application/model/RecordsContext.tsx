import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/entities/session';
import type { CoverLetter, CoverLetterSection } from '@/entities/cover-letter';
import { SEED_COVER_LETTER } from '@/entities/cover-letter';
import type { StoredFile } from '@/entities/file';
import { api } from '@/shared/api';
import { today, uid } from '@/shared/lib';
import type { Application } from './types';

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
  loading: boolean;
  getApplication: (id: string) => Application | undefined;
  createApplication: (data: Application) => Promise<string>;
  updateApplication: (id: string, patch: Partial<Application>) => Promise<void>;
  removeApplications: (ids: string[]) => Promise<void>;

  files: StoredFile[];
  addFiles: (kind: StoredFile['kind'], list: File[]) => Promise<void>;
  updateFile: (id: string, patch: Partial<StoredFile>) => void;
  removeFile: (id: string) => Promise<void>;

  coverLetter: CoverLetter;
  updateCoverLetter: (patch: Partial<Omit<CoverLetter, 'sections'>>) => void;
  updateSection: (id: string, patch: Partial<CoverLetterSection>) => void;
  addSection: (title?: string) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
  saveCoverLetter: () => Promise<void>;
}

const RecordsContext = createContext<RecordsValue | null>(null);

/**
 * @description 지원 기록 프로바이더 컴포넌트
 */
export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [coverLetter, setCoverLetter] = useState<CoverLetter>(SEED_COVER_LETTER);
  const [loading, setLoading] = useState(true);
  const fileTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setApplications([]);
      setFiles([]);
      setCoverLetter(SEED_COVER_LETTER);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all([
      api.get<{ items: Application[] }>('/applications', { pageSize: 500 }),
      api.get<StoredFile[]>('/files'),
      api.get<CoverLetter>('/cover-letter')
    ])
      .then(([appsRes, filesRes, cl]) => {
        if (!alive) return;
        setApplications(appsRes.items);
        setFiles(filesRes);
        setCoverLetter(cl);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [ready, user]);

  const getApplication = useCallback((id: string) => applications.find((a) => a.id === id), [applications]);

  const createApplication = useCallback(async (data: Application) => {
    const created = await api.post<Application>('/applications', data);
    setApplications((prev) => [created, ...prev]);
    return created.id;
  }, []);

  const updateApplication = useCallback(async (id: string, patch: Partial<Application>) => {
    const updated = await api.patch<Application>(`/applications/${id}`, patch);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const removeApplications = useCallback(async (ids: string[]) => {
    await api.del('/applications', { ids: ids.join(',') });
    setApplications((prev) => prev.filter((a) => !ids.includes(a.id)));
  }, []);

  const addFiles = useCallback(async (kind: StoredFile['kind'], list: File[]) => {
    const formData = new FormData();
    formData.append('kind', kind);
    list.forEach((f) => formData.append('file', f));
    const created = await api.upload<StoredFile[]>('/files', formData);
    setFiles((prev) => [...created, ...prev]);
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<StoredFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    window.clearTimeout(fileTimers.current[id]);
    fileTimers.current[id] = window.setTimeout(() => {
      api.patch(`/files/${id}`, patch).catch(() => {});
    }, 500);
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await api.del(`/files/${id}`);
    setFiles((prev) => prev.filter((f) => f.id !== id));
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

  const saveCoverLetter = useCallback(async () => {
    const saved = await api.put<CoverLetter>('/cover-letter', coverLetter);
    setCoverLetter(saved);
  }, [coverLetter]);

  const value = useMemo(
    () => ({
      applications,
      loading,
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
      loading,
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
