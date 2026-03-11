'use client';

import { useState } from 'react';
import { Photo } from '@/lib/api';
import styles from './PhotoGrid.module.css';

interface Props {
  photos: Photo[];
  onDelete: (id: string) => Promise<void> | void;
  featuredIds?: string[];
  onToggleFeatured?: (id: string) => void;
}

export default function PhotoGrid({ photos, onDelete, featuredIds = [], onToggleFeatured }: Props) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [lightboxConfirm, setLightboxConfirm] = useState(false);
  const [lightboxDeleting, setLightboxDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (confirmId !== photo.id) {
      setConfirmId(photo.id);
      return;
    }
    setDeletingId(photo.id);
    setConfirmId(null);
    await onDelete(photo.id);
    setDeletingId(null);
  };

  const handleLightboxDelete = async () => {
    if (!lightbox) return;
    if (!lightboxConfirm) { setLightboxConfirm(true); return; }
    setLightboxDeleting(true);
    await onDelete(lightbox.id);
    setLightboxDeleting(false);
    setLightboxConfirm(false);
    setLightbox(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setLightbox(null); setLightboxConfirm(false); }
    if (!lightbox) return;
    const idx = photos.findIndex((p) => p.id === lightbox.id);
    if (e.key === 'ArrowRight') { setLightbox(photos[(idx + 1) % photos.length]); setLightboxConfirm(false); }
    if (e.key === 'ArrowLeft') { setLightbox(photos[(idx - 1 + photos.length) % photos.length]); setLightboxConfirm(false); }
  };

  const navigate = (dir: 1 | -1) => {
    if (!lightbox) return;
    const idx = photos.findIndex((p) => p.id === lightbox.id);
    setLightbox(photos[(idx + dir + photos.length) % photos.length]);
    setLightboxConfirm(false);
  };

  return (
    <>
      <div className={styles.grid}>
        {photos.map((photo) => {
          const isFeatured = featuredIds.includes(photo.id);
          return (
            <div
              key={photo.id}
              className={`${styles.item} ${deletingId === photo.id ? styles.deleting : ''}`}
              onClick={() => { setLightbox(photo); setLightboxConfirm(false); }}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className={styles.img}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className={styles.imgFallback}>📷</div>

              <div className={styles.overlay}>
                <div className={styles.overlayActions} onClick={(e) => e.stopPropagation()}>
                  {/* Download */}
                  <a
                    href={photo.url}
                    download={photo.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    title="Скачать"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16V4m0 12-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>

                  {/* Featured star */}
                  {onToggleFeatured && (
                    <button
                      className={`${styles.actionBtn} ${isFeatured ? styles.actionBtnStar : ''}`}
                      title={isFeatured ? 'Убрать из баннера' : 'Добавить в баннер'}
                      onClick={() => onToggleFeatured(photo.id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={isFeatured ? 'currentColor' : 'none'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}

                  {/* Delete */}
                  {confirmId === photo.id ? (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={(e) => handleDelete(e, photo)}
                        disabled={deletingId === photo.id}
                      >
                        {deletingId === photo.id ? '...' : 'да'}
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                      >
                        нет
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => handleDelete(e, photo)}
                      title="Удалить"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className={styles.lightbox}
          onClick={() => { setLightbox(null); setLightboxConfirm(false); }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          autoFocus
          role="dialog"
          aria-label="Просмотр фото"
        >
          <button className={styles.lightboxClose} onClick={() => { setLightbox(null); setLightboxConfirm(false); }}>
            ×
          </button>

          {photos.length > 1 && (
            <>
              <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={(e) => { e.stopPropagation(); navigate(-1); }}>‹</button>
              <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={(e) => { e.stopPropagation(); navigate(1); }}>›</button>
            </>
          )}

          <img
            src={lightbox.url}
            alt={lightbox.filename}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />

          <div className={styles.lightboxBottom} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxActions}>
              <a
                href={lightbox.url}
                download={lightbox.filename}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.lightboxBtn} ${styles.lightboxBtnDownload}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4m0 12-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Скачать
              </a>

              <button
                className={`${styles.lightboxBtn} ${lightboxConfirm ? styles.lightboxBtnDangerConfirm : styles.lightboxBtnDanger}`}
                onClick={handleLightboxDelete}
                disabled={lightboxDeleting}
              >
                {lightboxDeleting ? '...' : lightboxConfirm ? 'Точно удалить?' : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    </svg>
                    Удалить
                  </>
                )}
              </button>
            </div>
            <div className={styles.lightboxCaption}>{lightbox.filename}</div>
          </div>
        </div>
      )}
    </>
  );
}
