'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

function Eye({ mouseX, mouseY, sleeping }: { mouseX: number; mouseY: number; sleeping: boolean }) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (sleeping || hovered || !eyeRef.current) return;
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(mouseY - cy, mouseX - cx);
    const dist = Math.hypot(mouseX - cx, mouseY - cy);
    const maxOff = dist < 30 ? 0 : 9;
    setOffset({ x: Math.cos(angle) * maxOff, y: Math.sin(angle) * maxOff });
  }, [mouseX, mouseY, sleeping, hovered]);

  return (
    <div
      ref={eyeRef}
      className={`${styles.eye} ${sleeping ? styles.eyeSleepy : ''} ${hovered ? styles.eyeSquint : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.eyeInner}>
        <div
          className={styles.pupil}
          style={{ transform: `translate(calc(-50% + ${sleeping ? 0 : offset.x}px), calc(-50% + ${sleeping ? 4 : offset.y}px))` }}
        >
          <div className={styles.pupilShine} />
        </div>
      </div>
      <div className={styles.eyelid} />
    </div>
  );
}

export default function LoginPage({ onLogin, error }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [sleeping, setSleeping] = useState(false);
  const [entered, setEntered] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdle = useCallback(() => {
    setSleeping(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setSleeping(true), 5000);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
      resetIdle();
    };
    window.addEventListener('mousemove', onMove);
    resetIdle();
    const t = setTimeout(() => setEntered(true), 80);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      clearTimeout(t);
    };
  }, [resetIdle]);

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
      theme: 'outline', size: 'large', width: 280, text: 'signin_with', locale: 'ru',
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) initGoogle();
  });

  return (
    <div className={styles.root}>
      <Script src="https://accounts.google.com/gsi/client" onLoad={initGoogle} />

      {/* Left decorative panel */}
      <div className={styles.left}>
        <div className={styles.shape1} />
        <div className={styles.shape2} />
        <div className={styles.shape3} />
        <div className={styles.shape4} />

        <div className={styles.polaroids}>
          <div className={`${styles.polaroid} ${styles.polaroid1}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-31.jpg" alt="" />
            <span className={styles.polaroidLabel}>моменты ☀️</span>
          </div>
          <div className={`${styles.polaroid} ${styles.polaroid2}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-38.jpg" alt="" />
            <span className={styles.polaroidLabel}>memories 📸</span>
          </div>
          <div className={`${styles.polaroid} ${styles.polaroid3}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-41.jpg" alt="" />
            <span className={styles.polaroidLabel}>хорошие дни ✨</span>
          </div>
          <div className={`${styles.polaroid} ${styles.polaroid4}`}>
            <img src="https://wqdqnxtcpmjfmcgjiqjz.supabase.co/storage/v1/object/public/photos/photo_2026-03-12_00-03-45.jpg" alt="" />
            <span className={styles.polaroidLabel}>навсегда 💫</span>
          </div>
        </div>

        <div className={styles.leftContent}>
          <p className={styles.leftMono}>фотогалерея</p>
          <h1 className={styles.leftTitle}>moments.</h1>
          <p className={styles.leftSub}>твои фото.<br />твои воспоминания.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={`${styles.card} ${entered ? styles.cardIn : ''}`}>
          <div className={styles.eyePair}>
            <Eye mouseX={mouse.x} mouseY={mouse.y} sleeping={sleeping} />
            <Eye mouseX={mouse.x} mouseY={mouse.y} sleeping={sleeping} />
          </div>

          <h2 className={styles.title}>Добро пожаловать</h2>
          <p className={styles.subtitle}>Войдите, чтобы увидеть свои моменты</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.btnWrap} ref={btnRef} />

          <p className={styles.hint}>
            {sleeping ? '😴 задремал...' : 'Безопасный вход через Google'}
          </p>
        </div>
      </div>
    </div>
  );
}
