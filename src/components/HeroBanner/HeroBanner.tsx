'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Photo, Album } from '@/lib/api';
import styles from './HeroBanner.module.css';

interface Props {
  photos: Photo[];
  albums: Album[];
}

export default function HeroBanner({ photos, albums }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const total = photos.length;

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total > 1) timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), 4000);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetTimer(); }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  const safeIndex = current >= total ? 0 : current;
  const photo = photos[safeIndex];
  const album = albums.find(a => a.id === photo?.album_id);

  if (!photo) return null;

  return (
    <div className={styles.root} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {photos.map((p, i) => (
        <div key={p.id} className={`${styles.slide} ${i === current ? styles.active : ''}`} aria-hidden={i !== current}>
          <img src={p.url} alt={p.filename} className={styles.img} />
        </div>
      ))}

      <div className={styles.gradient} />

      <div className={styles.caption}>
        {album && <span className={styles.albumTag}>{album.name}</span>}
        <p className={styles.captionTitle}>{photo.filename?.replace(/\.[^.]+$/, '')}</p>
      </div>

      {total > 1 && (
        <>
          <button className={`${styles.nav} ${styles.navPrev}`} onClick={() => { prev(); resetTimer(); }}>‹</button>
          <button className={`${styles.nav} ${styles.navNext}`} onClick={() => { next(); resetTimer(); }}>›</button>
          <div className={styles.dots}>
            {photos.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => { goTo(i); resetTimer(); }}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
