# Live Dashboard

Real-time device activity dashboard — publicly show what app you're using, with anime-inspired UI and privacy-first design.

Features a VN-style dialog box with cat ears, dramatized activity descriptions in Chinese (e.g., "正在B站划水摸鱼喵~"), falling sakura petals, and a three-tier privacy system that protects sensitive window titles.

## Screenshots

> TODO: Add screenshots

## Features

- **VN Dialog Box**: Cat-ear-decorated visual novel speech bubble showing current activity
- **Dramatized Descriptions**: Privacy-friendly activity text instead of raw app/window info (e.g., "正在用VS Code疯狂写bug喵~")
- **Rich Display Titles**: When privacy allows, shows what you're watching/listening/coding (e.g., "正在YouTube看「Minecraft Tutorial」喵~")
- **Three-Tier Privacy System**: SHOW / BROWSER / HIDE classification for window titles
- **Sakura Petal Animation**: 20 CSS-animated petals with natural sway, respects `prefers-reduced-motion`
- **Timeline View**: Aggregated daily timeline with duration calculation, date picker
- **Timezone-Aware**: Frontend sends timezone offset, backend queries local date correctly
- **Multi-Device**: Support multiple devices (Windows, Android) simultaneously
- **Battery Display**: Shows battery percentage and charging status (laptops/phones only)
- **Viewer Counter**: Real-time visitor count on the server side
- **Auto-Refresh**: 10-second polling with automatic offline detection (1 minute timeout)
- **NSFW Filtering**: Server-side blocklist silently discards matching records
- **HMAC Dedup**: Window titles hashed with HMAC-SHA256 for deduplication without storing plaintext

## Architecture

```
                    HTTPS POST                                Static Export
┌──────────────┐  ──────────────→  ┌───────────────────┐  ←───────────────  ┌──────────────┐
│ Windows Agent│                   │    Bun Backend     │                   │   Next.js    │
│  (Python)    │                   │   + SQLite + HMAC  │                   │  (SSG → /out)│
├──────────────┤                   ├───────────────────┤                   ├──────────────┤
│ Android Agent│  ──────────────→  │  Privacy Tiers     │  ──── serves ──→ │  Sakura UI   │
│ (Magisk/KSU) │                   │  NSFW Filter       │     static files  │  VN Dialog   │
└──────────────┘                   │  Display Title     │                   │  Timeline    │
                                   └───────────────────┘                   └──────────────┘
```

- **Communication**: HTTPS POST polling (short connections, firewall-friendly)
- **Storage**: SQLite via `bun:sqlite` (zero external dependencies)
- **Frontend**: 10-second auto-polling, static export served by backend
- **Data Retention**: 7-day automatic cleanup
- **Privacy**: Window titles never stored in plaintext; HMAC hash for dedup only
- **Viewer Tracking**: Server-side count returned with `/api/current`

## Privacy Tier System

The backend classifies each app into one of three privacy tiers:

| Tier | Behavior | Example Apps |
|------|----------|--------------|
| **SHOW** | Extract meaningful title from `window_title` | YouTube, Spotify, VS Code, Steam, Genshin Impact |
| **BROWSER** | Strip browser suffix, check for sensitive content | Chrome, Edge, Firefox, Safari |
| **HIDE** | `display_title` empty, `window_title` not stored | Telegram, WeChat, Discord, Banking apps |

### SHOW Tier

- **Video**: Extracts video title (strips "- YouTube", "\_哔哩哔哩\_bilibili" suffixes)
- **Music**: Extracts song info (handles Spotify, foobar2000 formats)
- **IDE**: Extracts project/file name (handles VS Code `—`, JetBrains `–`, Sublime `-` separators)
- **Documents**: Extracts document name from Word, Excel, Notion, Obsidian titles
- **Games/Galgame**: Uses window title directly as game title

### BROWSER Tier

1. Strip browser name suffix (handles Edge zero-width characters and profile patterns)
2. If title contains video site keywords → show as video title
3. If title contains sensitive keywords (email, banking, login, etc.) → hide
4. Otherwise → show page title

### HIDE Tier

Messaging, email, finance, system utilities, proxy tools, shopping apps — `window_title` is discarded server-side, only the app name is stored.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | [Bun](https://bun.sh/) + TypeScript + SQLite |
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 (static export) |
| Windows Agent | Python + ctypes Win32 API + psutil |
| Android Agent | Shell script (Magisk/KernelSU module) |
| Deployment | Docker (multi-stage build) + Nginx reverse proxy |

## Project Structure

```
live-dashboard/
├── packages/
│   ├── backend/                  # Bun backend server
│   │   └── src/
│   │       ├── index.ts          # HTTP server + static file serving
│   │       ├── db.ts             # SQLite schema, migrations, HMAC hashing
│   │       ├── types.ts          # TypeScript type definitions
│   │       ├── routes/
│   │       │   ├── report.ts     # POST /api/report (agent upload)
│   │       │   ├── current.ts    # GET /api/current (device states)
│   │       │   ├── timeline.ts   # GET /api/timeline (daily timeline)
│   │       │   └── health.ts     # GET /api/health
│   │       ├── middleware/
│   │       │   └── auth.ts       # Bearer token authentication
│   │       ├── services/
│   │       │   ├── privacy-tiers.ts  # Three-tier privacy + title processing
│   │       │   ├── nsfw-filter.ts    # NSFW content filter
│   │       │   ├── app-mapper.ts     # Process/package name → display name
│   │       │   ├── visitors.ts       # Online viewer counter
│   │       │   └── cleanup.ts        # 7-day data cleanup + offline detection
│   │       └── data/
│   │           ├── app-names.json        # App name dictionary
│   │           └── nsfw-blocklist.json   # NSFW blocklist
│   │
│   └── frontend/                 # Next.js frontend
│       ├── app/                  # Pages + globals.css (sakura, VN styles)
│       └── src/
│           ├── components/       # CurrentStatus, DeviceCard, Timeline, Header, DatePicker
│           ├── hooks/            # useDashboard (polling hook)
│           └── lib/              # API client + dramatized app descriptions
│
├── agents/
│   ├── windows/                  # Windows Agent
│   │   ├── agent.py              # Main script (Win32 API + battery)
│   │   ├── config.json           # Config (gitignored)
│   │   ├── requirements.txt      # Python dependencies
│   │   ├── build.bat             # PyInstaller packaging
│   │   └── install-task.bat      # Windows Task Scheduler auto-start
│   │
│   └── android/                  # Android Agent (Magisk/KSU module)
│       ├── service.sh            # Main script (dumpsys + curl)
│       ├── config.sh             # Config (gitignored)
│       └── module.prop           # Module metadata
│
├── deploy/nginx/                 # Nginx config example
├── Dockerfile                    # Multi-stage build (frontend + backend)
├── docker-compose.yml            # Container orchestration
└── .env.example                  # Environment variable template
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- Node.js 18+ (only needed for frontend build)

### 1. Configure Environment

```bash
cp .env.example packages/backend/.env
```

Edit `packages/backend/.env`:

```env
# Format: token:device_id:device_name:platform
DEVICE_TOKEN_1=your_secret_token:my-pc:My PC:windows

# Generate: openssl rand -hex 32
HASH_SECRET=your_random_secret_here
```

### 2. Start Backend

```bash
cd packages/backend
bun install
bun run src/index.ts
```

### 3. Build & Serve Frontend

```bash
cd packages/frontend
bun install
bun run build

# Copy static build to backend
cp -r out/* ../backend/public/
```

Visit `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DEVICE_TOKEN_N` | Yes | Device token. Format: `token:device_id:name:platform` | `abc123:my-pc:My PC:windows` |
| `HASH_SECRET` | Yes | HMAC-SHA256 key for title hashing. Generate with `openssl rand -hex 32` | `a1b2c3d4...` |
| `PORT` | No | Listen port (default: 3000) | `3000` |
| `STATIC_DIR` | No | Frontend static file directory (default: `./public`) | `./public` |
| `DB_PATH` | No | SQLite database path (default: `./live-dashboard.db`) | `/data/live-dashboard.db` |

Multiple devices: increment the number suffix — `DEVICE_TOKEN_1`, `DEVICE_TOKEN_2`, `DEVICE_TOKEN_3`...

## API Reference

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/report` | Agent reports current app | Bearer token |
| GET | `/api/current` | Get all device states + viewer count | None |
| GET | `/api/timeline?date=YYYY-MM-DD&tz=-480` | Get daily timeline (tz = getTimezoneOffset) | None |
| GET | `/api/health` | Health check | None |

### Report Payload

```json
{
  "app_id": "chrome.exe",
  "window_title": "GitHub - live-dashboard - Google Chrome",
  "timestamp": 1741866000000,
  "extra": {
    "battery_percent": 85,
    "battery_charging": true
  }
}
```

### Current Response

```json
{
  "devices": [
    {
      "device_id": "my-pc",
      "device_name": "My PC",
      "platform": "windows",
      "app_name": "Chrome",
      "display_title": "GitHub - live-dashboard",
      "is_online": 1,
      "last_seen_at": "2026-03-14T12:00:00.000Z",
      "extra": { "battery_percent": 85, "battery_charging": true }
    }
  ],
  "recent_activities": [...],
  "server_time": "2026-03-14T12:00:05.000Z",
  "viewer_count": 3
}
```

## Agent Setup

### Windows Agent

1. Install Python 3.10+ and dependencies:
   ```bash
   pip install -r agents/windows/requirements.txt
   ```

2. Create `agents/windows/config.json` (this file is gitignored):
   ```json
   {
     "server_url": "https://your-domain.com",
     "token": "your_device_token_here",
     "interval_seconds": 5,
     "heartbeat_seconds": 60
   }
   ```

3. Run: `python agents/windows/agent.py`

4. Or package as .exe: run `build.bat`, then use `install-task.bat` for auto-start

**Battery**: Laptop users will see battery info automatically via `psutil.sensors_battery()`. Desktop PCs show no battery (expected).

### Android Agent (Magisk / KernelSU)

1. Create `agents/android/config.sh` (gitignored):
   ```bash
   SERVER_URL="https://your-domain.com"
   TOKEN="your_device_token_here"
   ```

2. Install as a Magisk/KernelSU module (zip the `agents/android/` folder)

3. The `service.sh` script runs in background, polling `dumpsys` for foreground app

## Docker Deployment

```bash
# 1. Configure
cp .env.example .env
# Edit .env with your tokens and HASH_SECRET

# 2. Create Docker network (if using external network with Nginx)
docker network create your_network_name

# 3. Update docker-compose.yml
# - Change the network name to match your setup
# - Adjust ipv4_address if needed

# 4. Build and start
docker compose up -d --build

# 5. Check logs
docker logs live_dashboard --tail 50
```

The Dockerfile uses multi-stage builds: stage 1 builds the Next.js frontend, stage 2 runs the Bun backend with the static output. The container runs as a non-root user.

### Nginx Reverse Proxy

See `deploy/nginx/example.conf` for a reference configuration. Key points:

- Rate limiting on `/api/report` to prevent abuse
- Proxy headers for correct client IP detection
- HTTPS with your own certificates (or Cloudflare origin certs)

## Security Design

- **Device Auth**: Per-device Bearer tokens via environment variables (not stored in code)
- **Identity Binding**: Token resolves to `device_id` server-side; request body `device_id` is ignored
- **Privacy Tiers**: Three-level classification; HIDE-tier apps have `window_title` discarded before DB write
- **HMAC Hashing**: `window_title` hashed with HMAC-SHA256 (keyed) for dedup; not reversible without the secret
- **NSFW Filter**: Server-side blocklist, matching records silently discarded
- **Dedup**: SQLite unique constraint `(device_id, app_id, title_hash, time_bucket)` + `ON CONFLICT DO NOTHING`
- **Path Traversal Protection**: Normalized path + relative check + realpath symlink validation for static files
- **HTTPS Enforced**: Windows agent rejects non-HTTPS `server_url`
- **Rate Limiting**: Nginx `limit_req` on report endpoint
- **XSS Protection**: React JSX default escaping, `Content-Type: application/json`, `X-Content-Type-Options: nosniff`
- **Non-Root Container**: Docker runs as unprivileged `dashboard` user
- **Offline Detection**: Devices marked offline after 1 minute of inactivity

## Adding New Apps

To add support for a new application:

1. **`packages/backend/src/data/app-names.json`** — Map process name (Windows) or package name (Android) to display name
2. **`packages/backend/src/services/privacy-tiers.ts`** — Assign privacy tier (SHOW/BROWSER/HIDE) and add to category set (`ideApps`, `musicApps`, etc.) if applicable
3. **`packages/frontend/src/lib/app-descriptions.ts`** — Add dramatized description and optional title template

## Customization

### Changing the Theme

Edit CSS variables in `packages/frontend/app/globals.css`:

```css
@theme {
  --color-cream: #FFF8E7;        /* Page background */
  --color-sakura-bg: #FFF0F3;    /* Sakura tint */
  --color-card: #FFFDF7;         /* Card background */
  --color-border: #E8D5C4;       /* Card borders */
  --color-primary: #E8A0BF;      /* Primary pink (ears, petals, accents) */
  --color-secondary: #88C9C9;    /* Secondary teal */
  --color-accent: #E8B86D;       /* Accent gold */
}
```

### Changing Descriptions

Edit `packages/frontend/src/lib/app-descriptions.ts`. Each app has:
- A generic description (when no `display_title` available)
- An optional title template (when `display_title` is present)

## License

MIT
