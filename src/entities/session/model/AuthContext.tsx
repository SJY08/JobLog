import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { User } from './types';

const STORAGE_KEY = 'joblog-auth';

interface AuthValue {
  user: User | null;
  signingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

const DEMO_USER: User = {
  name: '김대마',
  email: 'dmg.kim@dsmhs.kr',
  school: '대덕소프트웨어마이스터고등학교 3학년',
  initial: '김'
};

/**
 * @description 인증 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [signingIn, setSigningIn] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    await new Promise((r) => window.setTimeout(r, 900));
    setUser(DEMO_USER);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
    } catch {}
    setSigningIn(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, signingIn, signInWithGoogle, signOut }),
    [user, signingIn, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @description 인증 상태를 읽는 훅
 */
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
