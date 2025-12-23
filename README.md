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

## Deployment

### Docker Deployment (Recommended)

The project includes Docker configuration for easy deployment.

**Prerequisites:**
- Docker 20.10+
- Docker Compose 2.0+

**Quick Start:**

```bash
# Start all services (MySQL, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services:**

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| MySQL | folder-explorer-db | 3309 | Database |
| Backend | folder-explorer-api | 3001 | Elysia API |
| Frontend | folder-explorer-web | 80 | Vue + Nginx |

**Access:**
- Frontend: http://localhost
- API: http://localhost:3001
- Database: `mysql://root:root@localhost:3309/folder_explorer`

### Database Migration (Production)

```bash
# After containers are running, run migrations
docker exec folder-explorer-api bun run db:push

# Seed with sample data (optional)
docker exec folder-explorer-api bun run db:seed
```

### Production Environment Variables

```bash
# docker-compose.yml overrides
DATABASE_URL=mysql://root:root@mysql:3306/folder_explorer
PORT=3001
NODE_ENV=production
```

### Manual Deployment

**Backend:**
```bash
cd be-elysia
bun install --production
bun run build
NODE_ENV=production bun run dist/index.js
```

**Frontend:**
```bash
cd fe-vue
bun install
bun run build
# Serve dist/ folder with Nginx or any static file server
```

## License

MIT
