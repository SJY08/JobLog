import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, clearToken, getToken, setToken } from '@/shared/api';
import type { User } from './types';

const GOOGLE_SCOPE = 'openid email profile';

interface AuthValue {
  user: User | null;
  ready: boolean;
  signingIn: boolean;
  signInError: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

class PopupClosedError extends Error {
  type: string;
  constructor(type: string) {
    super(type);
    this.type = type;
  }
}

/**
 * @description 인증 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');

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
      setSignInError('로그인 준비 중입니다. 잠시 후 다시 눌러 주세요.');
      return;
    }

    setSignInError('');
    setSigningIn(true);
    try {
      const accessToken = await new Promise<string>((resolve, reject) => {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPE,
          callback: (response) => {
            if (response.access_token) resolve(response.access_token);
            else reject(new Error(response.error ?? '구글 로그인이 취소되었습니다.'));
          },
          // 사용자가 팝업을 닫거나 팝업이 차단된 경우
          error_callback: (err) => reject(new PopupClosedError(err.type))
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
      if (err instanceof PopupClosedError) {
        if (err.type === 'popup_failed_to_open') setSignInError('팝업이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해 주세요.');
      } else {
        setSignInError('로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
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
    () => ({ user, ready, signingIn, signInError, signInWithGoogle, signOut }),
    [user, ready, signingIn, signInError, signInWithGoogle, signOut]
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
