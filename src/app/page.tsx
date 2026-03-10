'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, User, Album } from '@/lib/api';
import LoginPage from '@/components/LoginPage/LoginPage';
import AlbumCard from '@/components/AlbumCard/AlbumCard';
import UploadZone from '@/components/UploadZone/UploadZone';
import styles from './page.module.css';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlbums = useCallback(async () => {
    try {
      const data = await api.albums.list();
      setAlbums(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('momenty_token');
    const savedUser = localStorage.getItem('momenty_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadAlbums().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadAlbums]);

  const handleLogin = async (payload: { googleId: string; email: string; name: string; avatar?: string }) => {
    try {
      const { token, user: me } = await api.auth.google(payload);
      localStorage.setItem('momenty_token', token);
      localStorage.setItem('momenty_user', JSON.stringify(me));
      setUser(me);
      await loadAlbums();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка входа');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('momenty_token');
    localStorage.removeItem('momenty_user');
    setUser(null);
    setAlbums([]);
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

  if (loading) {
    return (
      <div className={styles.splash}>
        <span className={styles.splashTitle}>МОМЕНТЫ</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={error} />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>МОМЕНТЫ</h1>
        <div className={styles.headerRight}>
          {user.avatar && (
            <img src={user.avatar} alt={user.name} className={styles.avatar} />
          )}
          <span className={styles.userName}>{user.name}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Ваши{'\n'}моменты</h2>
        <span className={styles.heroBadge}>фотогалерея</span>
      </div>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Загрузить фото</h2>
          </div>
          <UploadZone onUploaded={loadAlbums} />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Альбомы</h2>
            <button
              className={styles.newBtn}
              onClick={() => setShowNewAlbum((v) => !v)}
            >
              {showNewAlbum ? 'Отмена' : '+ Новый'}
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
              <button
                className={styles.createBtn}
                type="submit"
                disabled={creatingAlbum}
              >
                {creatingAlbum ? '...' : 'Создать'}
              </button>
            </form>
          )}

          {albums.length === 0 ? (
            <p className={styles.empty}>Нет альбомов — создайте первый</p>
          ) : (
            <div className={styles.albumsGrid}>
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onDelete={handleDeleteAlbum}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
