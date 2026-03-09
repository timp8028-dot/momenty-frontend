# Моменты — Frontend

Next.js 15 frontend for the Моменты photo platform.

## Setup

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_API_URL=https://momenty-backend-production.up.railway.app
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 15** + React 19
- **TypeScript**
- **CSS Modules** — dark theme, DM Serif Display + DM Mono, accent `#c8a96e`
- **Google Identity Services** — OAuth via backend `POST /auth/google`
