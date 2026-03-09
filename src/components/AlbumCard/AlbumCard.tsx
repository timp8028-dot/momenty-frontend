'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Album } from '@/lib/api';
import styles from './AlbumCard.module.css';

interface Props {
  album: Album;
  onDelete: (id: string) => void;
}

export default function AlbumCard({ album, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    onDelete(album.id);
  };

  return (
    <Link href={`/albums/${album.id}`} className={styles.card}>
      <div className={styles.cover}>
        {album.cover_photo ? (
          <img src={album.cover_photo} alt={album.name} className={styles.coverImg} />
        ) : (
          <div className={styles.coverEmpty}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17l4.5-4.5 3 3 3-3 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.name}>{album.name}</span>
        <div className={styles.actions} onClick={(e) => e.preventDefault()}>
          {confirmDelete ? (
            <>
              <button
                className={styles.confirmBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '...' : 'удалить?'}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(false);
                }}
              >
                отмена
              </button>
            </>
          ) : (
            <button className={styles.deleteBtn} onClick={handleDelete}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
