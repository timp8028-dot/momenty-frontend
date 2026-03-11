'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, User, Album, Photo } from '@/lib/api';
import LoginPage from '@/components/LoginPage/LoginPage';
import AlbumCard from '@/components/AlbumCard/AlbumCard';
import UploadZone from '@/components/UploadZone/UploadZone';
import PhotoGrid from '@/components/PhotoGrid/PhotoGrid';
import EyesMascot from '@/components/EyesMascot/EyesMascot';
import styles from './page.module.css';

type Tab = 'albums' | 'photos';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<Tab>('albums');
  const [loading, setLoading] = useState(true);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleCopyToken = () => {
    const token = localStorage.getItem('momenty_token');
    if (!token) return;
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const loadAlbums = useCallback(async () => {
    try {
      const data = await api.albums.list();
      setAlbums(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
  }, []);

  const loadPhotos = useCallback(async () => {
    try {
      const data = await api.photos.list();
      setPhotos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('momenty_token');
    const savedUser = localStorage.getItem('momenty_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      Promise.all([loadAlbums(), loadPhotos()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadAlbums, loadPhotos]);

  const handleLogin = async (payload: { googleId: string; email: string; name: string; avatar?: string }) => {
    try {
      setLoginError(null);
      const { token, user: me } = await api.auth.google(payload);
      localStorage.setItem('momenty_token', token);
      localStorage.setItem('momenty_user', JSON.stringify(me));
      setUser(me);
      await Promise.all([loadAlbums(), loadPhotos()]);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Ошибка входа');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('momenty_token');
    localStorage.removeItem('momenty_user');
    setUser(null);
    setAlbums([]);
    setPhotos([]);
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    setCreatingAlbum(true);
    try {
      const album = await api.albums.create(newAlbumName.trim());
      setAlbums((prev) => [album, ...prev]);
      setNewAlbumName('');
      setShowNewAlbum(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка создания');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    try {
      await api.albums.delete(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await api.photos.delete(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  const handleUploaded = () => {
    loadAlbums();
    loadPhotos();
  };

  if (loading) {
    return (
      <div className={styles.splash}>
        <span className={styles.splashEyes}>◉ ◉</span>
        <span className={styles.splashTitle}>moments.</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className={styles.page}>
      <EyesMascot />

      <header className={styles.header}>
        <span className={styles.logo}>moments.</span>

        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'albums' ? styles.tabActive : ''}`}
            onClick={() => setTab('albums')}
          >
            Альбомы
          </button>
          <button
            className={`${styles.tab} ${tab === 'photos' ? styles.tabActive : ''}`}
            onClick={() => setTab('photos')}
          >
            Все фото
          </button>
        </nav>

        <div className={styles.headerRight}>
          {user.avatar && (
            <img src={user.avatar} alt={user.name} className={styles.avatar} />
          )}
          <button className={styles.tgBtn} onClick={handleCopyToken} title="Скопировать токен для Telegram бота">
            {tokenCopied ? '✓ скопировано' : 'токен для бота'}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            выйти
          </button>
        </div>
      </header>

      <div className={styles.hero}>
        <p className={styles.heroMono}>фотогалерея</p>
        <h1 className={styles.heroTitle}>
          {tab === 'albums' ? 'Ваши\nальбомы' : 'Все\nфото'}
        </h1>
        <p className={styles.heroSub}>
          {tab === 'albums'
            ? `${albums.length} альбом${albums.length === 1 ? '' : albums.length < 5 ? 'а' : 'ов'}`
            : `${photos.length} фото`
          }
        </p>
      </div>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <section className={styles.uploadSection}>
          <UploadZone onUploaded={handleUploaded} />
        </section>

        {tab === 'albums' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Альбомы</h2>
              <button
                className={styles.newBtn}
                onClick={() => setShowNewAlbum((v) => !v)}
              >
                {showNewAlbum ? 'отмена' : '+ новый'}
              </button>
            </div>

            {showNewAlbum && (
              <form className={styles.newAlbumForm} onSubmit={handleCreateAlbum}>
                <input
                  className={styles.input}
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="название альбома"
                  autoFocus
                />
                <button className={styles.createBtn} type="submit" disabled={creatingAlbum}>
                  {creatingAlbum ? '...' : 'создать'}
                </button>
              </form>
            )}

            {albums.length === 0 ? (
              <p className={styles.empty}>Нет альбомов — создайте первый</p>
            ) : (
              <div className={styles.albumsGrid}>
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} onDelete={handleDeleteAlbum} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'photos' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Все фото</h2>
            </div>
            {photos.length === 0 ? (
              <p className={styles.empty}>Нет фото — загрузите первое</p>
            ) : (
              <PhotoGrid photos={photos} onDelete={handleDeletePhoto} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
