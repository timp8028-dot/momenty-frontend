'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import styles from './LoginPage.module.css';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

interface GooglePayload {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Props {
  onLogin: (payload: GooglePayload) => void;
  error?: string | null;
}

export default function LoginPage({ onLogin, error }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  function initGoogle() {
    if (initialized.current || !btnRef.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    initialized.current = true;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        const payload = JSON.parse(atob(res.credential.split('.')[1]));
        onLogin({ googleId: payload.sub, email: payload.email, name: payload.name, avatar: payload.picture });
      },
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'signin_with',
      locale: 'ru',
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initGoogle();
    }
  });

  return (
    <div className={styles.root}>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initGoogle}
      />

      {/* Left pink panel */}
      <div className={styles.left}>
        <div className={styles.shape} aria-hidden />
        <h1 className={styles.bigTitle}>
          МО<br />МЕН<br />ТЫ
        </h1>
        <span className={styles.tagline}>фотогалерея</span>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>Войти</h2>
            <p className={styles.cardSubtitle}>Сохраняйте лучшие мгновения</p>
          </div>

          <hr className={styles.divider} />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.btnWrap} ref={btnRef} />

          <p className={styles.hint}>
            Авторизация через Google — быстро и безопасно
          </p>
        </div>
      </div>
    </div>
  );
}
