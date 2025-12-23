# 📁 Folder Explorer

A modern Windows Explorer clone built with **Clean Architecture** principles.

![Score](https://img.shields.io/badge/Backend-9%2F10-green)
![Score](https://img.shields.io/badge/Frontend-9.6%2F10-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

### Core
- 📂 Two-panel layout (folder tree + contents)
- 🌳 Unlimited folder nesting with lazy loading
- 🔍 Real-time search with cursor pagination
- 📱 Grid/List view toggle
- ⌨️ Full keyboard navigation
- ♿ WCAG accessibility (ARIA labels)

### Scalability
- ⚡ Redis caching (5min TTL)
- 🔒 Redis-based rate limiting (100 req/min)
- 📖 Read/Write database split ready
- 📄 Cursor pagination (O(1) at any page)

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Backend | Elysia.js + TypeScript |
| Frontend | Vue.js 3 + TypeScript + Vite |
| Database | MySQL 8.0 + Drizzle ORM |
| Cache | Redis 7 |
| Styling | TailwindCSS |

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Bun 1.0+ (for local commands)

### 3-Step Setup

```bash
# 1. Start all services
docker-compose up -d --build

# 2. Create database tables
cd be-elysia && bun run db:push

# 3. Seed sample data (485 items)
bun run db:seed
```

**Open:** http://localhost:8080

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| folder-explorer-web | 8080 | Frontend (Vue + Nginx) |
| folder-explorer-api | 3001 | Backend (Elysia) |
| folder-explorer-db | 3309 | MySQL 8.0 |
| folder-explorer-cache | 6379 | Redis 7 |

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/health |

## 📦 Docker Commands

```bash
# Start
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Reset (delete data)
docker-compose down -v
```

## 🗄️ Database Commands

Run from `be-elysia/` directory:

```bash
# Create tables
bun run db:push

# Seed data
bun run db:seed

# Open database GUI
bun run db:studio
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/folders/tree` | Full folder tree |
| GET | `/api/v1/folders/root/children` | Root level items |
| GET | `/api/v1/folders/:id/children` | Folder contents |
| GET | `/api/v1/folders/:id/subfolders` | Subfolders only (lazy load) |
| GET | `/api/v1/folders/search?q=` | Search with cursor |
| POST | `/api/v1/folders` | Create folder |
| PATCH | `/api/v1/folders/:id` | Rename folder |
| DELETE | `/api/v1/folders/:id` | Delete folder |

## 🏗️ Project Structure

```
windows-explorer/
├── be-elysia/                    # Backend
│   └── src/
│       ├── domain/               # Entities, Interfaces
│       ├── application/          # Use Cases
│       ├── infrastructure/       # Database, Cache, Repository
│       │   ├── database/
│       │   │   ├── connection.ts # Read/Write split
│       │   │   ├── schema.ts
│       │   │   └── seed.ts
│       │   ├── cache/
│       │   │   └── RedisCache.ts
│       │   └── repositories/
│       └── presentation/         # Routes, Middlewares
│
├── fe-vue/                       # Frontend
│   └── src/
│       ├── domain/               # Types
│       ├── application/          # Services, Composables
│       │   ├── services/
│       │   └── composables/
│       │       └── useErrorHandler.ts
│       ├── infrastructure/       # API Client
│       └── presentation/         # Components, Pages
│           └── components/
│               ├── ErrorBoundary.vue
│               ├── ErrorToast.vue
│               ├── SkeletonLoader.vue
│               ├── FolderTree.vue
│               ├── ContentPanel.vue
│               └── icons/
│
├── docker-compose.yml
└── technical-document.md         # Full documentation
```

## ⚙️ Environment Variables

```bash
# Database
DB_HOST=127.0.0.1
DB_PORT=3309
DB_USER=root
DB_PASSWORD=root
DB_NAME=folder_explorer

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Production (Read/Write Split)
DB_WRITE_HOST=mysql-master
DB_READ_HOST=mysql-replica
```

## 🎨 UI Features

- **Modern Header** - Gradient logo, search with icon
- **SVG Icons** - 20+ file type icons with colors
- **View Toggle** - Grid/List layouts
- **Breadcrumbs** - Path navigation
- **Skeletons** - Loading placeholders
- **Empty States** - Illustrated placeholders
- **Error Handling** - Boundary + Toast notifications

## ♿ Accessibility

- ARIA roles and labels
- Keyboard navigation (Tab, Enter, Space, Arrows)
- Focus management with visible rings
- Screen reader support

## 📚 Documentation

See `technical-document.md` for:
- Clean Architecture explanation
- Algorithm complexity analysis
- Database schema details
- All implementation details

## 📄 License

MIT