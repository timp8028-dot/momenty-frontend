'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './EyesMascot.module.css';

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
    const maxOff = dist < 20 ? 0 : 9;
    setOffset({ x: Math.cos(angle) * maxOff, y: Math.sin(angle) * maxOff });
  }, [mouseX, mouseY, sleeping, hovered]);

  return (
    <div
      ref={eyeRef}
      className={`${styles.eye} ${sleeping ? styles.sleepy : ''} ${hovered ? styles.squint : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={styles.pupil}
        style={{
          transform: `translate(calc(-50% + ${sleeping ? 0 : offset.x}px), calc(-50% + ${sleeping ? 3 : offset.y}px))`,
        }}
      >
        <div className={styles.shine} />
      </div>
      <div className={styles.lid} />
    </div>
  );
}

export default function EyesMascot() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [sleeping, setSleeping] = useState(false);
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
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  return (
    <div className={styles.root}>
      <div className={styles.face}>
        <Eye mouseX={mouse.x} mouseY={mouse.y} sleeping={sleeping} />
        <Eye mouseX={mouse.x} mouseY={mouse.y} sleeping={sleeping} />
      </div>
      {sleeping && <p className={styles.zzz}>zzz</p>}
    </div>
  );
}
