'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import styles from './LoginPage.module.css';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GooglePayload { googleId: string; email: string; name: string; avatar?: string; }
interface Props { onLogin: (payload: GooglePayload) => void; error?: string | null; }

export default function LoginPage({ onLogin, error }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  function initGoogle() {
    if (initialized.current || !btnRef.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    initialized.current = true;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        const p = JSON.parse(atob(res.credential.split('.')[1]));
        onLogin({ googleId: p.sub, email: p.email, name: p.name, avatar: p.picture });
      },
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black', size: 'large', width: 280, text: 'signin_with', locale: 'ru',
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) initGoogle();
  });

  return (
    <div className={styles.root}>
      <Script src="https://accounts.google.com/gsi/client" onLoad={initGoogle} />

      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.grain} />

        <div className={styles.leftContent}>
          <p className={styles.leftLabel}>фотогалерея</p>
          <h1 className={styles.leftTitle}>moments.</h1>
          <p className={styles.leftSub}>твои фото. твои воспоминания.</p>
        </div>

        <div className={styles.polaroidStack}>
          <div className={`${styles.polaroid} ${styles.p1}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-31.jpg" alt="" />
            <span className={styles.polaroidLabel}>моменты</span>
          </div>
          <div className={`${styles.polaroid} ${styles.p2}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-38.jpg" alt="" />
            <span className={styles.polaroidLabel}>memories</span>
          </div>
          <div className={`${styles.polaroid} ${styles.p3}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-41.jpg" alt="" />
            <span className={styles.polaroidLabel}>хорошие дни</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={`${styles.card} ${entered ? styles.cardIn : ''}`}>

          {/* App icon */}
          <div className={styles.appIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="9" width="26" height="18" rx="3" stroke="#c8a96e" strokeWidth="1.8"/>
              <path d="M11 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="#c8a96e" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="16" cy="18" r="4" stroke="#c8a96e" strokeWidth="1.8"/>
              <circle cx="24" cy="13" r="1" fill="#c8a96e"/>
            </svg>
          </div>

          <h2 className={styles.title}>Добро пожаловать</h2>
          <p className={styles.subtitle}>Войдите, чтобы увидеть свои моменты</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.btnWrap} ref={btnRef} />

          <p className={styles.hint}>Безопасный вход через Google</p>
        </div>
      </div>
    </div>
  );
}
