'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { api, Album, Photo } from '@/lib/api';
import PhotoGrid from '@/components/PhotoGrid/PhotoGrid';
import UploadZone from '@/components/UploadZone/UploadZone';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AlbumPage({ params }: Props) {
  const { id } = use(params);
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const loadPhotos = useCallback(async () => {
    try {
      const data = await api.photos.list(id);
      setPhotos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('momenty_token');
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthorized(true);

    const loadAll = async () => {
      try {
        const [albumsData, photosData] = await Promise.all([
          api.albums.list(),
          api.photos.list(id),
        ]);
        const found = albumsData.find((a) => a.id === id);
        setAlbum(found || null);
        setPhotos(photosData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [id]);

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await api.photos.delete(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  if (!authorized && !loading) {
    return (
      <div className={styles.center}>
        <p className={styles.msg}>Необходима авторизация</p>
        <Link href="/" className={styles.backLink}>
          Войти
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <span className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Моменты
        </Link>
        <h1 className={styles.title}>{album?.name ?? 'Альбом'}</h1>
        <span className={styles.count}>{photos.length} фото</span>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <section className={styles.uploadSection}>
          <UploadZone albumId={id} onUploaded={loadPhotos} />
        </section>

        <section>
          {photos.length === 0 ? (
            <p className={styles.empty}>В этом альбоме пока нет фото</p>
          ) : (
            <PhotoGrid photos={photos} onDelete={handleDeletePhoto} />
          )}
        </section>
      </main>
    </div>
  );
}
