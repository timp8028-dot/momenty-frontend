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

  const handleLogin = async (credential: string) => {
    try {
      const { token, user: me } = await api.auth.google(credential);
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
        <span className={styles.splashTitle}>Моменты</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={error} />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Моменты</h1>
        <div className={styles.headerRight}>
          {user.avatar && (
            <img src={user.avatar} alt={user.name} className={styles.avatar} />
          )}
          <span className={styles.userName}>{user.name}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            выйти
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Без альбома</h2>
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
              <button
                className={styles.createBtn}
                type="submit"
                disabled={creatingAlbum}
              >
                {creatingAlbum ? '...' : 'создать'}
              </button>
            </form>
          )}

          {albums.length === 0 ? (
            <p className={styles.empty}>нет альбомов</p>
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
