import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, clearToken, getToken, setToken } from '@/shared/api';
import type { User } from './types';

const GOOGLE_SCOPE = 'openid email profile';

interface AuthValue {
  user: User | null;
  ready: boolean;
  signingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

/**
 * @description 인증 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get<User>('/auth/me')
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setReady(true));
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!window.google || !clientId) {
      console.error('구글 로그인 스크립트를 불러오지 못했습니다.');
      return;
    }

    setSigningIn(true);
    try {
      const accessToken = await new Promise<string>((resolve, reject) => {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPE,
          callback: (response) => {
            if (response.access_token) resolve(response.access_token);
            else reject(new Error(response.error ?? '구글 로그인이 취소되었습니다.'));
          }
        });
        client.requestAccessToken();
      });

      const { user: nextUser, accessToken: sessionToken } = await api.post<{ user: User; accessToken: string }>(
        '/auth/google',
        { idToken: accessToken }
      );
      setToken(sessionToken);
      setUser(nextUser);
    } catch (err) {
      console.error(err instanceof ApiError ? err.message : err);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signingIn, signInWithGoogle, signOut }),
    [user, ready, signingIn, signInWithGoogle, signOut]
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
