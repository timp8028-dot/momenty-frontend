'use client';

import { useState } from 'react';
import { Photo } from '@/lib/api';
import styles from './PhotoGrid.module.css';

interface Props {
  photos: Photo[];
  onDelete: (id: string) => void;
}

export default function PhotoGrid({ photos, onDelete }: Props) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (confirmId !== photo.id) {
      setConfirmId(photo.id);
      return;
    }
    setDeletingId(photo.id);
    onDelete(photo.id);
    setConfirmId(null);
    if (lightbox?.id === photo.id) setLightbox(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setLightbox(null);
    if (!lightbox) return;
    const idx = photos.findIndex((p) => p.id === lightbox.id);
    if (e.key === 'ArrowRight') setLightbox(photos[(idx + 1) % photos.length]);
    if (e.key === 'ArrowLeft') setLightbox(photos[(idx - 1 + photos.length) % photos.length]);
  };

  return (
    <>
      <div className={styles.grid} onKeyDown={handleKeyDown}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={styles.item}
            onClick={() => setLightbox(photo)}
          >
            <img src={photo.url} alt={photo.filename} className={styles.img} loading="lazy" />

            <div className={styles.overlay}>
              {confirmId === photo.id ? (
                <div className={styles.confirmRow} onClick={(e) => e.stopPropagation()}>
                  <button
                    className={styles.confirmBtn}
                    onClick={(e) => handleDelete(e, photo)}
                    disabled={deletingId === photo.id}
                  >
                    {deletingId === photo.id ? '...' : 'удалить'}
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                  >
                    нет
                  </button>
                </div>
              ) : (
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, photo)}
                  title="Удалить"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className={styles.lightbox}
          onClick={() => setLightbox(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          autoFocus
          role="dialog"
          aria-label="Просмотр фото"
        >
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
            ×
          </button>

          <button
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              const idx = photos.findIndex((p) => p.id === lightbox.id);
              setLightbox(photos[(idx - 1 + photos.length) % photos.length]);
            }}
          >
            ‹
          </button>

          <img
            src={lightbox.url}
            alt={lightbox.filename}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onClick={(e) => {
              e.stopPropagation();
              const idx = photos.findIndex((p) => p.id === lightbox.id);
              setLightbox(photos[(idx + 1) % photos.length]);
            }}
          >
            ›
          </button>

          <div className={styles.lightboxCaption}>
            {lightbox.filename}
          </div>
        </div>
      )}
    </>
  );
}
