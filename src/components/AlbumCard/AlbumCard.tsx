'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Album } from '@/lib/api';
import styles from './AlbumCard.module.css';

const ACCENTS = [
  { bg: '#2ECC71' },
  { bg: '#2D6BE4' },
  { bg: '#FF5C5C' },
  { bg: '#FFD600' },
];

const ICONS = ['🌿', '🏖️', '🎉', '🌸', '🏔️', '🌙', '🎨', '🐾', '🍂', '✈️', '🎵', '🌊'];

function getAccent(id: string) {
  const code = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ACCENTS[code % ACCENTS.length];
}

function getIcon(id: string) {
  const code = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ICONS[code % ICONS.length];
}

interface Props {
  album: Album;
  onDelete: (id: string) => void;
}

export default function AlbumCard({ album, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const accent = getAccent(album.id);
  const icon = getIcon(album.id);

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
      <div
        className={styles.cover}
        style={album.cover_photo ? undefined : { background: accent.bg }}
      >
        {album.cover_photo ? (
          <img src={album.cover_photo} alt={album.name} className={styles.coverImg} />
        ) : (
          <div className={styles.coverEmpty}>
            <span className={styles.coverIcon}>{icon}</span>
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
                нет
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
