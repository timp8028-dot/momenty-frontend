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

interface Props {
  onLogin: (credential: string) => void;
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
      callback: (res) => onLogin(res.credential),
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
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

      <div className={styles.card}>
        <h1 className={styles.title}>Моменты</h1>
        <p className={styles.subtitle}>Сохраняйте лучшие мгновения</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.btnWrap} ref={btnRef} />

        <p className={styles.hint}>
          Войдите через Google, чтобы начать
        </p>
      </div>

      <div className={styles.bg} aria-hidden />
    </div>
  );
}
