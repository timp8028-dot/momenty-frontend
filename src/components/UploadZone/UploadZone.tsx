'use client';

import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import styles from './UploadZone.module.css';

interface Props {
  albumId?: string;
  onUploaded?: () => void;
}

interface UploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  preview: string;
}

export default function UploadZone({ albumId, onUploaded }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        status: 'pending',
        preview: URL.createObjectURL(file),
      }));
    if (!newItems.length) return;

    setItems((prev) => [...prev, ...newItems]);

    newItems.forEach((item) => {
      uploadFile(item);
    });
  }, [albumId, onUploaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFile = async (item: UploadItem) => {
    setItems((prev) =>
      prev.map((i) => (i.preview === item.preview ? { ...i, status: 'uploading' } : i))
    );

    try {
      const form = new FormData();
      form.append('file', item.file);
      if (albumId) form.append('album_id', albumId);

      await api.photos.upload(form);

      setItems((prev) =>
        prev.map((i) => (i.preview === item.preview ? { ...i, status: 'done' } : i))
      );
      onUploaded?.();
    } catch (e) {
      setItems((prev) =>
        prev.map((i) =>
          i.preview === item.preview
            ? { ...i, status: 'error', error: e instanceof Error ? e.message : 'Ошибка' }
            : i
        )
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const clearDone = () => {
    setItems((prev) => {
      prev.filter((i) => i.status === 'done').forEach((i) => URL.revokeObjectURL(i.preview));
      return prev.filter((i) => i.status !== 'done');
    });
  };

  const hasDone = items.some((i) => i.status === 'done');

  return (
    <div className={styles.root}>
      <div
        className={`${styles.zone} ${dragging ? styles.dragging : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className={styles.hidden}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <svg className={styles.icon} width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 15v2a4 4 0 004 4h10a4 4 0 004-4v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className={styles.label}>
          {dragging ? 'Отпустите файлы' : 'Перетащите фото или нажмите для выбора'}
        </p>
        <p className={styles.hint}>JPG, PNG, WEBP, HEIC</p>
      </div>

      {items.length > 0 && (
        <div className={styles.queue}>
          <div className={styles.queueHeader}>
            <span className={styles.queueTitle}>
              Очередь загрузки ({items.filter((i) => i.status === 'done').length}/{items.length})
            </span>
            {hasDone && (
              <button className={styles.clearBtn} onClick={clearDone}>
                очистить готовые
              </button>
            )}
          </div>
          <div className={styles.thumbs}>
            {items.map((item) => (
              <div key={item.preview} className={`${styles.thumb} ${styles[item.status]}`}>
                <img src={item.preview} alt={item.file.name} className={styles.thumbImg} />
                <div className={styles.thumbStatus}>
                  {item.status === 'uploading' && <span className={styles.spinner} />}
                  {item.status === 'done' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {item.status === 'error' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
                {item.status === 'error' && (
                  <div className={styles.thumbError}>{item.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
