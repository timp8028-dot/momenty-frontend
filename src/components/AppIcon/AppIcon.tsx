import styles from './AppIcon.module.css';

type IconType = 'camera' | 'image' | 'star' | 'music' | 'location' | 'smile' | 'calendar' | 'chat' | 'upload' | 'heart';

const ICONS: Record<IconType, { bg: string; svg: React.ReactNode }> = {
  camera: {
    bg: '#A8D8F0',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3h6l1.5 2H19a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2.5L9 3z" fill="white" fillOpacity="0.9"/>
        <circle cx="12" cy="12" r="3.2" fill="white" fillOpacity="0.4"/>
        <circle cx="12" cy="12" r="1.8" fill="white"/>
        <circle cx="17.5" cy="8" r="1" fill="white" fillOpacity="0.6"/>
      </svg>
    ),
  },
  image: {
    bg: '#F0B8D0',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="3" fill="white" fillOpacity="0.9"/>
        <circle cx="8.5" cy="9.5" r="1.5" fill="#F0B8D0"/>
        <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="#F0B8D0" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  star: {
    bg: '#FFD97D',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3l2.5 5.5 6 .8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l6-.8L12 3z" fill="white" fillOpacity="0.9"/>
      </svg>
    ),
  },
  music: {
    bg: '#C5A8E8',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 17H7a2 2 0 110-4h2V7l8-2v4l-8 2v6z" fill="white" fillOpacity="0.9"/>
        <circle cx="7" cy="17" r="2" fill="white"/>
        <circle cx="15" cy="13" r="2" fill="white"/>
      </svg>
    ),
  },
  location: {
    bg: '#7DCFBF',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.7 2 6 4.7 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6z" fill="white" fillOpacity="0.9"/>
        <circle cx="12" cy="8" r="2" fill="#7DCFBF"/>
      </svg>
    ),
  },
  smile: {
    bg: '#FFB08A',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="9.5" cy="10.5" r="1" fill="#FFB08A"/>
        <circle cx="14.5" cy="10.5" r="1" fill="#FFB08A"/>
        <path d="M9 14.5c.8 1.5 2.2 2 3 2s2.2-.5 3-2" stroke="#FFB08A" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  calendar: {
    bg: '#A8D5A2',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="2.5" fill="white" fillOpacity="0.9"/>
        <path d="M3 10h18" stroke="#A8D5A2" strokeWidth="1.3"/>
        <rect x="8" y="2" width="2" height="5" rx="1" fill="white"/>
        <rect x="14" y="2" width="2" height="5" rx="1" fill="white"/>
        <circle cx="9" cy="15" r="1.2" fill="#A8D5A2"/>
        <circle cx="12" cy="15" r="1.2" fill="#A8D5A2"/>
        <circle cx="15" cy="15" r="1.2" fill="#A8D5A2"/>
      </svg>
    ),
  },
  chat: {
    bg: '#B3EDE8',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 3V6a2 2 0 012-2z" fill="white" fillOpacity="0.9"/>
        <circle cx="8.5" cy="10" r="1" fill="#B3EDE8"/>
        <circle cx="12" cy="10" r="1" fill="#B3EDE8"/>
        <circle cx="15.5" cy="10" r="1" fill="#B3EDE8"/>
      </svg>
    ),
  },
  upload: {
    bg: '#A8C8F0',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 4v12M8 8l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  heart: {
    bg: '#FFB3C1',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 20.5S3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 12.5-9 12.5z" fill="white" fillOpacity="0.9"/>
      </svg>
    ),
  },
};

const ALBUM_ICON_SEQUENCE: IconType[] = ['camera', 'image', 'location', 'star', 'music', 'heart', 'calendar', 'chat', 'smile'];

export function getAlbumIcon(id: string): IconType {
  const code = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ALBUM_ICON_SEQUENCE[code % ALBUM_ICON_SEQUENCE.length];
}

interface Props {
  type: IconType;
  size?: number;
}

export default function AppIcon({ type, size = 64 }: Props) {
  const { bg, svg } = ICONS[type];
  return (
    <div
      className={styles.icon}
      style={{ width: size, height: size, background: bg, borderRadius: size * 0.24 }}
    >
      {svg}
    </div>
  );
}
