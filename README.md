# Folder Explorer - Clean Architecture

A Windows Explorer clone built with **Elysia.js** (Backend) and **Vue.js 3** (Frontend) using **Clean Architecture** principles.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Bun |
| **Backend** | Elysia.js + TypeScript |
| **Frontend** | Vue.js 3 (Composition API) + TypeScript + Vite |
| **Database** | MySQL + Drizzle ORM |
| **Styling** | TailwindCSS |
| **Architecture** | Clean Architecture |
| **Structure** | Monorepo (npm workspaces) |

## Project Structure

```
├── be-elysia/                    # Backend
│   ├── drizzle.config.ts         # Drizzle ORM config
│   └── src/
│       ├── domain/               # Entities & Interfaces
│       │   ├── entities/
│       │   │   └── Folder.ts
│       │   └── interfaces/
│       │       └── IFolderRepository.ts
│       ├── application/          # Use Cases
│       │   └── usecases/
│       │       ├── GetFolderTree.ts
│       │       ├── GetChildren.ts
│       │       ├── CreateFolder.ts
│       │       └── SearchFolders.ts
│       ├── infrastructure/       # Database & Repository
│       │   ├── database/
│       │   │   ├── schema.ts
│       │   │   ├── connection.ts
│       │   │   └── seed.ts
│       │   └── repositories/
│       │       └── FolderRepository.ts
│       └── presentation/         # API Routes
│           └── routes/
│               └── folderRoutes.ts
│
├── fe-vue/                       # Frontend
│   └── src/
│       ├── domain/               # Entities
│       │   └── entities/
│       │       └── Folder.ts
│       ├── application/          # Services (Composables)
│       │   └── services/
│       │       └── FolderService.ts
│       ├── infrastructure/       # API Client
│       │   └── api/
│       │       └── FolderApi.ts
│       └── presentation/         # Vue Components
│           └── components/
│               ├── FolderTree.vue
│               ├── FolderTreeNode.vue
│               └── ContentPanel.vue
│
├── architecture.txt              # Architecture Documentation
├── lazyloading.txt               # Lazy Loading Guide
└── package.json                  # Monorepo Config
```

## Getting Started

### Prerequisites

- Bun 1.0+
- MySQL 8.0+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash
```

### Database Setup

```bash
cd be-elysia

# Push schema to database
bun run db:push

# Seed database with sample data
bun run db:seed
```

### Development

```bash
# Run both backend and frontend
npm run dev

# Or run separately
cd be-elysia && bun run dev    # Backend on http://localhost:3001
cd fe-vue && bun run dev       # Frontend on http://localhost:5173
```

### Build

```bash
npm run build
```

## API Endpoints (REST v1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/folders/tree` | Get complete folder tree (left panel) |
| GET | `/api/v1/folders/:id/children` | Get direct children (right panel) |
| GET | `/api/v1/folders/:id` | Get single folder details |
| GET | `/api/v1/folders/search?q=` | Search folders and files |
| POST | `/api/v1/folders` | Create new folder |
| PATCH | `/api/v1/folders/:id` | Rename folder |
| DELETE | `/api/v1/folders/:id` | Delete folder and children |

## Features

### Core Requirements
- [x] Two-panel layout (left: folder tree, right: contents)
- [x] Display complete folder structure on load
- [x] Unlimited subfolder nesting levels
- [x] Click folder to show direct children
- [x] Expandable/collapsible folders in tree

### Bonus Features
- [x] Search function
- [x] Display files in right panel
- [x] Clean Architecture
- [x] Service and Repository layers
- [x] REST API standards (versioning, naming)
- [x] Bun runtime
- [x] Elysia framework
- [x] Monorepo structure
- [x] ORM (Drizzle)

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│            (API Routes, Vue Components)                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                          │
│                  (Use Cases)                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│              (Entities, Interfaces)                     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                         │
│              (Database, Repositories)                   │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
TABLE: folders
├── id          INT (PK, Auto-increment)
├── name        VARCHAR(255)
├── parent_id   INT (FK, nullable)
├── is_folder   BOOLEAN
├── created_at  TIMESTAMP
└── updated_at  TIMESTAMP
```

## Environment Variables

```bash
# be-elysia/.env
DATABASE_URL=mysql://root:password@localhost:3309/folder_explorer
PORT=3001
```

## Docker Deployment (Recommended)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start (3 Steps)

```bash
# Step 1: Start all services
docker-compose up -d --build

# Step 2: Create database table (run from local machine)
cd be-elysia
bun run db:push

# Step 3: Seed sample data (485 folders/files)
bun run db:seed
```

**That's it!** Open http://localhost:8080 to see the app.

### Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **Frontend** | folder-explorer-web | 8080 | Vue.js + Nginx |
| **Backend** | folder-explorer-api | 3001 | Elysia.js API |
| **Database** | folder-explorer-db | 3309 | MySQL 8.0 |
| **Cache** | folder-explorer-cache | 6379 | Redis 7 |

### Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/health |

### Docker Commands

```bash
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f redis

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Check service status
docker-compose ps
```

### Database Commands

**Important:** Run these from your local machine (not inside Docker), as they connect to the Docker MySQL via port 3309.

```bash
cd be-elysia

# Push schema to database (creates tables)
bun run db:push

# Seed database with 485 sample folders/files
bun run db:seed

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Environment Variables

The Docker containers use these default values:

```bash
# Database
DB_HOST=mysql              # Docker service name
DB_PORT=3306               # Internal MySQL port
DB_USER=root
DB_PASSWORD=root
DB_NAME=folder_explorer

# Redis
REDIS_HOST=redis           # Docker service name
REDIS_PORT=6379

# Backend
PORT=3001
NODE_ENV=production
```

For local development connecting to Docker services:

```bash
# be-elysia/.env
DB_HOST=127.0.0.1
DB_PORT=3309               # Exposed port
DB_USER=root
DB_PASSWORD=root
DB_NAME=folder_explorer
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Production Deployment

For production with separate read replicas:

```bash
# Environment variables for read/write split
DB_WRITE_HOST=mysql-master.internal
DB_WRITE_PORT=3306
DB_READ_HOST=mysql-replica.internal
DB_READ_PORT=3306
```

---

## Manual Deployment (Without Docker)

### Backend

```bash
cd be-elysia
bun install
bun run db:push
bun run db:seed
bun run dev          # Development
bun run build        # Production build
```

### Frontend

```bash
cd fe-vue
bun install
bun run dev          # Development (http://localhost:5173)
bun run build        # Production build (outputs to dist/)
```

## License

MIT
