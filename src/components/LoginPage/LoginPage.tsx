'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
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

interface EyeOffset { x: number; y: number }

function Eye({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<EyeOffset>({ x: 0, y: 0 });

  useEffect(() => {
    if (!eyeRef.current) return;
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(mouseY - cy, mouseX - cx);
    const dist = Math.min(Math.hypot(mouseX - cx, mouseY - cy), 999);
    const maxOffset = dist < 20 ? 0 : 7;
    setOffset({
      x: Math.cos(angle) * maxOffset,
      y: Math.sin(angle) * maxOffset,
    });
  }, [mouseX, mouseY]);

  return (
    <div className={styles.eye} ref={eyeRef}>
      <div
        className={styles.pupil}
        style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }}
      />
    </div>
  );
}

export default function LoginPage({ onLogin, error }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [entered, setEntered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    // Entry animation
    const t = setTimeout(() => setEntered(true), 100);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(t);
    };
  }, [handleMouseMove]);

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
    if (typeof window !== 'undefined' && window.google) initGoogle();
  });

  return (
    <div className={styles.root}>
      <Script src="https://accounts.google.com/gsi/client" onLoad={initGoogle} />

      {/* Floating blobs */}
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />

      <div className={`${styles.card} ${entered ? styles.cardVisible : ''}`}>
        {/* Eyes mascot */}
        <div className={styles.eyePair}>
          <Eye mouseX={mouse.x} mouseY={mouse.y} />
          <Eye mouseX={mouse.x} mouseY={mouse.y} />
        </div>

        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Моменты</h1>
          <p className={styles.subtitle}>Сохраняйте лучшие мгновения</p>
        </div>

        <div className={styles.divider}>
          <span>войти через</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.btnWrap} ref={btnRef} />

        <p className={styles.hint}>Безопасный вход через Google</p>
      </div>
    </div>
  );
}
