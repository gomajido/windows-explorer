# Windows Explorer Clone - Technical Documentation

> A Windows Explorer clone built with Clean Architecture principles

## Table of Contents

- [Tech Stack](#tech-stack)
- [UI Specification](#ui-specification)
- [Clean Architecture](#clean-architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Algorithms](#algorithms)
- [Best Practices](#best-practices)
- [Scalability Features](#scalability-features)
- [UI/UX Features](#uiux-features)
- [Accessibility](#accessibility)
- [Docker Deployment](#docker-deployment)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Bun |
| **Backend** | Elysia.js + TypeScript |
| **Frontend** | Vue.js 3 (Composition API) + TypeScript + Vite |
| **Database** | MySQL 8.0 + Drizzle ORM |
| **Cache** | Redis 7 |
| **Styling** | TailwindCSS |
| **Structure** | Monorepo (npm workspaces) |

---

## UI Specification

```
+---------------------------+-------------------------------------+
|                           |                                     |
|    LEFT PANEL             |    RIGHT PANEL                      |
|    (Folder Tree)          |    (Direct Children)                |
|                           |                                     |
|    > Documents            |    Shows direct children of         |
|      > Work               |    selected folder from left panel  |
|      > Personal           |                                     |
|    > Downloads            |    Example: Click "Documents":      |
|    > Pictures             |      - Work (folder)                |
|      > Wallpapers         |      - Personal (folder)            |
|    > Music                |      - report.txt (file)            |
|    > Videos               |      - notes.txt (file)             |
|                           |                                     |
+---------------------------+-------------------------------------+
```

### Behavior

- **On load**: Fetch root folders → Display tree structure on LEFT panel
- **On click folder**: Display direct children (subfolders + files) on RIGHT panel
- **Folders in LEFT panel**: Expandable/collapsible with lazy loading
- **Unlimited nesting levels** supported

---

## Clean Architecture

Clean Architecture separates code into layers with clear dependencies:

```
┌─────────────────────────────────────────────┐
│              PRESENTATION                   │
│      (Controllers, Routes, Components)      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              APPLICATION                    │
│           (Use Cases / Services)            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│                DOMAIN                       │
│        (Entities, Interfaces/Ports)         │
└─────────────────────────────────────────────┘
                    ▲
                    │
┌─────────────────────────────────────────────┐
│            INFRASTRUCTURE                   │
│        (Database/ORM, External APIs)        │
└─────────────────────────────────────────────┘
```

**Key Principle**: Dependencies point INWARD (outer layers depend on inner layers)

---

## Project Structure

```
windows-explorer/
├── package.json                    # Root workspace config
├── docker-compose.yml              # Docker orchestration
├── README.md
├── technical-document.md           # This file
│
├── be-elysia/                      # BACKEND
│   ├── drizzle.config.ts           # Drizzle ORM config
│   └── src/
│       ├── index.ts                # Entry point
│       │
│       ├── domain/                 # Layer 1: Core Business Logic
│       │   ├── entities/
│       │   │   └── Folder.ts
│       │   └── interfaces/
│       │       └── IFolderRepository.ts
│       │
│       ├── application/            # Layer 2: Use Cases
│       │   └── usecases/
│       │       ├── GetFolderTree.ts
│       │       ├── GetChildren.ts
│       │       ├── CreateFolder.ts
│       │       └── SearchFolders.ts
│       │
│       ├── infrastructure/         # Layer 3: External Implementations
│       │   ├── database/
│       │   │   ├── schema.ts       # Drizzle schema
│       │   │   ├── connection.ts   # Read/Write split
│       │   │   └── seed.ts         # Seed data
│       │   ├── cache/
│       │   │   └── RedisCache.ts   # Redis caching
│       │   └── repositories/
│       │       └── FolderRepository.ts
│       │
│       └── presentation/           # Layer 4: API Routes
│           ├── routes/
│           │   └── folderRoutes.ts
│           └── middlewares/
│               └── rateLimitMiddleware.ts
│
└── fe-vue/                         # FRONTEND
    └── src/
        ├── domain/                 # Layer 1: Types
        │   └── entities/
        │       └── Folder.ts
        │
        ├── application/            # Layer 2: Services
        │   ├── services/
        │   │   └── FolderService.ts
        │   └── composables/
        │       └── useErrorHandler.ts
        │
        ├── infrastructure/         # Layer 3: API Client
        │   └── api/
        │       └── FolderApi.ts
        │
        └── presentation/           # Layer 4: Vue Components
            ├── pages/
            │   └── HomePage.vue
            └── components/
                ├── FolderTree.vue
                ├── FolderTreeNode.vue
                ├── ContentPanel.vue
                ├── SkeletonLoader.vue
                ├── ErrorBoundary.vue
                ├── ErrorToast.vue
                └── icons/
                    ├── Icon.vue
                    └── index.ts
```

---

## API Endpoints

**Base URL**: `http://localhost:3001/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/folders/tree` | Get complete folder tree |
| GET | `/folders/root/children` | Get root level items |
| GET | `/folders/:id/children` | Get direct children of folder |
| GET | `/folders/:id/subfolders` | Get subfolders only (lazy load) |
| GET | `/folders/:id` | Get single folder details |
| GET | `/folders/search?q=term` | Search folders and files |
| POST | `/folders` | Create new folder |
| PATCH | `/folders/:id` | Rename folder |
| DELETE | `/folders/:id` | Delete folder and children |

### Response Format

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T> {
  httpCode: number;      // HTTP status code (200, 201, 400, 404, 500)
  message: string;       // Human-readable message
  code: string;          // Response code (SUCCESS, CREATED, NOT_FOUND, etc.)
  data?: T;              // Response payload
  detail?: string;       // Additional error details
  pagination?: {         // For paginated responses
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: ErrorInfo[];  // Validation errors
}
```

**Success Response Example:**
```json
{
  "httpCode": 200,
  "message": "Folder tree retrieved",
  "code": "SUCCESS",
  "data": [...]
}
```

**Error Response Example:**
```json
{
  "httpCode": 404,
  "message": "Resource not found",
  "code": "NOT_FOUND",
  "detail": "Folder with ID 999 does not exist",
  "data": null
}
```

### Response Codes

| Code | HTTP | Description |
|------|------|-------------|
| `SUCCESS` | 200 | Request successful |
| `CREATED` | 201 | Resource created |
| `UPDATED` | 200 | Resource updated |
| `DELETED` | 200 | Resource deleted |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid request |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `INTERNAL_ERROR` | 500 | Server error |

### Pagination (Cursor-based)

```
GET /folders/search/cursor?q=doc&cursor=123&limit=20

Response:
{
  "httpCode": 200,
  "message": "Search completed",
  "code": "SUCCESS",
  "data": {
    "data": [...],
    "cursor": {
      "next": "143",
      "hasMore": true
    }
  }
}
```

---

## Database Schema

### `folders` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-increment primary key |
| `name` | VARCHAR(255) | Folder/file name |
| `parent_id` | INT (FK) | Reference to parent (NULL = root) |
| `is_folder` | BOOLEAN | true = folder, false = file |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last modified timestamp |
| `deleted_at` | TIMESTAMP | Soft delete timestamp (NULL = active) |

### Indexes

- `PRIMARY KEY (id)` - Fast single record lookup
- `INDEX (parent_id)` - Fast children query
- `INDEX (name)` - Fast search queries

### Tree Algorithm: Adjacency List

Why Adjacency List?

| Structure | Insert/Delete | Get Subtree | Complexity |
|-----------|---------------|-------------|------------|
| **Adjacency List** ✅ | O(1) | O(n) with Map | Simple |
| Nested Set | O(n) rebalance | O(1) | Complex |
| Materialized Path | O(depth) | O(n) string | Medium |
| Closure Table | O(depth²) | O(1) | Extra table |

---

## Algorithms

### 1. Tree Building Algorithm - O(n)

**Location**: `FolderRepository.getFolderTree()`

```typescript
// Step 1: Fetch all folders (single query)
const allFolders = await db.select().from(folders);

// Step 2: Create Map for O(1) lookup
const folderMap = new Map<number, FolderTreeNode>();
for (const record of allFolders) {
  folderMap.set(record.id, { ...record, children: [] });
}

// Step 3: Link children to parents
const rootFolders: FolderTreeNode[] = [];
for (const record of allFolders) {
  const node = folderMap.get(record.id);
  if (record.parentId === null) {
    rootFolders.push(node);
  } else {
    const parent = folderMap.get(record.parentId);
    parent?.children.push(node);
  }
}

return rootFolders;
```

**Complexity**:
- Time: O(n) - Two passes through data
- Space: O(n) - Map stores all nodes

### 2. Recursive Delete - DFS

**Location**: `FolderRepository.deleteRecursive()`

```typescript
async deleteRecursive(id: number): Promise<void> {
  // Get all direct children
  const children = await db.select()
    .from(folders)
    .where(eq(folders.parentId, id));
  
  // Recursively delete each child first (DFS)
  for (const child of children) {
    await this.deleteRecursive(child.id);
  }
  
  // Then delete self
  await db.delete(folders).where(eq(folders.id, id));
}
```

### 3. Cursor Pagination - O(1)

```typescript
async findWithCursor(parentId: number, cursor?: number, limit = 20) {
  const query = db.select()
    .from(folders)
    .where(
      and(
        eq(folders.parentId, parentId),
        cursor ? gt(folders.id, cursor) : undefined
      )
    )
    .orderBy(folders.id)
    .limit(limit + 1);
  
  const results = await query;
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  return { data, nextCursor, hasMore };
}
```

### Algorithm Complexity Summary

| Algorithm | Time | Space | Location |
|-----------|------|-------|----------|
| Tree Building | O(n) | O(n) | FolderRepository |
| Recursive Delete | O(n) | O(depth) | FolderRepository |
| Cursor Pagination | O(1) | O(limit) | FolderRepository |
| Search | O(log n)* | O(1) | FolderRepository |

*With database index

---

## Best Practices

### Architecture

| Practice | Implementation |
|----------|----------------|
| Clean Architecture | 4 layers: Domain → Application → Infra → Presentation |
| Separation of Concerns | Each layer has single responsibility |
| Dependency Inversion | Use cases depend on interfaces, not concrete |
| Repository Pattern | Abstract database access behind interface |

### SOLID Principles

- **S** - Single Responsibility: Each use case does ONE thing
- **O** - Open/Closed: Can swap MySQL for PostgreSQL without changing use cases
- **L** - Liskov Substitution: Any IFolderRepository implementation can be substituted
- **I** - Interface Segregation: Focused, cohesive methods
- **D** - Dependency Inversion: High-level modules don't depend on low-level

### Code Quality

| Practice | Implementation |
|----------|----------------|
| TypeScript Strict | Full type safety, no implicit any |
| Error Handling | try/catch with proper logging |
| Input Validation | Use cases validate before processing |
| Small Functions | Methods are 5-15 lines |
| DRY Principle | Reusable mappers and utilities |

### REST API

| Practice | Implementation |
|----------|----------------|
| API Versioning | `/api/v1/folders` |
| Resource Naming | Nouns: `/folders`, not `/getFolder` |
| HTTP Methods | GET, POST, PATCH, DELETE |
| Consistent Response | `{ success, data, error }` |
| Proper Status Codes | 200, 201, 404, 429, 500 |

---

## Scalability Features

### 1. Cursor-based Pagination

**Why**: Traditional offset pagination scans all previous rows. Cursor jumps directly.

| Method | Page 1000 | Reason |
|--------|-----------|--------|
| Offset | O(1000) | Scans all previous rows |
| **Cursor** ✅ | O(1) | Direct index lookup |

### 2. Lazy Tree Loading

**Why**: Loading entire tree (millions of folders) on page load is not scalable.

| Strategy | Initial Load | Memory |
|----------|--------------|--------|
| Load entire tree | O(n) | All folders |
| **Lazy loading** ✅ | O(root) | Only expanded |

### 3. Redis Caching (5min TTL)

**Why**: Database queries are expensive. Redis provides sub-ms retrieval.

**Cache Keys**:
- `children:{parentId}` - Folder children
- `folder:{id}` - Single folder details

**Invalidation**: On CREATE/UPDATE/DELETE operations

### 4. Redis Rate Limiting

**Why**: In-memory rate limiting doesn't work with multiple server instances.

**Config**: 100 requests per minute per IP

| In-Memory | Redis ✅ |
|-----------|----------|
| Per-instance state | Shared across instances |
| Lost on restart | Persists across restarts |
| Can't scale | Works with load balancer |

### 5. Read/Write Database Split

**Why**: Single database becomes bottleneck under heavy load.

**Location**: `be-elysia/src/infrastructure/database/connection.ts`

```typescript
// Master (writes): 10 connections
const masterPool = mysql.createPool({
  host: DB_WRITE_HOST,
  connectionLimit: 10
});

// Replica (reads): 20 connections
const replicaPool = mysql.createPool({
  host: DB_READ_HOST,
  connectionLimit: 20
});

export const writeDb = drizzle(masterPool);
export const readDb = drizzle(replicaPool);
```

| Operation | Database | Reason |
|-----------|----------|--------|
| SELECT | readDb | Can use any replica |
| INSERT/UPDATE/DELETE | writeDb | Must go to master |

### 6. Query Safety Limits

```typescript
const MAX_QUERY_LIMIT = 1000;   // Hard limit
const DEFAULT_PAGE_SIZE = 20;   // Default pagination
const MAX_SEARCH_RESULTS = 50;  // Search limit
```

### 7. Soft Delete

**Why**: Hard deletes are irreversible. Soft delete allows recovery.

```sql
deleted_at TIMESTAMP NULL  -- NULL = active, timestamp = deleted
```

---

## UI/UX Features

### 1. Modern Header
- Gradient logo (blue-500 to blue-600)
- Search bar with icon
- View toggle button (grid/list)
- Refresh button

### 2. SVG File Icons (20+)

**Location**: `fe-vue/src/presentation/components/icons/index.ts`

| File Type | Color |
|-----------|-------|
| Folders | Amber |
| PDF | Red |
| Excel/CSV | Green |
| Word/Doc | Blue |
| Images | Purple |
| Code | Various |
| Music | Pink |
| Video | Indigo |

### 3. Grid/List View Toggle
- **Grid**: Icon-based layout (6 columns)
- **List**: Table with Name, Type, Modified

### 4. Breadcrumb Navigation
- Home button with icon
- Current folder path display

### 5. Skeleton Loaders

**Location**: `fe-vue/src/presentation/components/SkeletonLoader.vue`

| Type | Usage |
|------|-------|
| `tree` | Folder sidebar |
| `list` | File list view |
| `grid` | Grid view |

### 6. Better Empty States
- "No folder selected" with illustration
- "This folder is empty" with illustration

### 7. Error Handling

**Components**:
- `ErrorBoundary.vue` - Catches component errors
- `ErrorToast.vue` - Toast notifications
- `useErrorHandler.ts` - Error state management

---

## Accessibility

### ARIA Roles and Labels

| Component | ARIA Attributes |
|-----------|-----------------|
| App container | `role="application"` `aria-label="File Explorer"` |
| Header | `role="banner"` |
| Search input | `role="searchbox"` `aria-label="Search files..."` |
| Breadcrumb | `<nav aria-label="Breadcrumb">` |
| Folder sidebar | `<aside role="navigation">` |
| Folder tree | `role="tree"` `aria-labelledby="..."` |
| Tree items | `role="treeitem"` `aria-expanded="true/false"` |
| Content area | `<main role="main">` |
| File list | `role="grid"` |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate between elements |
| Enter | Select/Open folder |
| Space | Toggle expand/collapse |
| Arrow Right | Expand folder |
| Arrow Left | Collapse folder |
| Escape | Clear search |

### Focus Management
- Visible focus rings (`focus:ring-2 focus:ring-blue-500`)
- `tabindex="0"` on interactive elements
- Screen reader labels (`aria-label`)

---

## Docker Deployment

### Services

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
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/health |

### Quick Start

```bash
# 1. Start all services
docker-compose up -d --build

# 2. Create database tables
cd be-elysia && bun run db:push

# 3. Seed sample data (485 items)
bun run db:seed
```

### Commands

```bash
# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down

# Reset (delete data)
docker-compose down -v
```

---

## Testing

### Unit Tests (Backend)

**Location**: `be-elysia/src/__tests__/`

```
__tests__/
├── helpers/
│   └── mockRepository.ts      # Shared mocks
├── domain/
│   └── Folder.test.ts         # Domain constants
├── routes/
│   └── folderRoutes.test.ts   # API integration
└── usecases/
    ├── CreateFolder.test.ts
    ├── DeleteFolder.test.ts
    ├── GetChildren.test.ts
    ├── GetFolderTree.test.ts
    ├── SearchFolders.test.ts
    └── UpdateFolder.test.ts
```

**Run Tests:**
```bash
cd be-elysia && bun test
```

**Coverage**: 28 tests

| Category | Tests | Coverage |
|----------|-------|----------|
| Use Cases | 18 | CRUD operations |
| Domain | 4 | Constants validation |
| Routes | 6 | API integration |

### E2E Tests (Frontend - Playwright)

**Location**: `fe-vue/e2e/`

```
e2e/
├── app.spec.ts              # App loading
├── folder-navigation.spec.ts # Navigation
├── search.spec.ts           # Search
└── accessibility.spec.ts    # A11y
```

**Run Tests:**
```bash
cd fe-vue

# Install browsers (first time)
bunx playwright install

# Run tests
bun run test:e2e

# Run with UI
bun run test:e2e:ui

# Run with browser visible
bun run test:e2e:headed
```

**Coverage**: 16 tests

| Suite | Tests | Coverage |
|-------|-------|----------|
| App | 4 | Loading, sidebar, search input |
| Navigation | 4 | Expand, select, view toggle |
| Search | 4 | Input, focus, typing |
| Accessibility | 4 | ARIA, keyboard, focus |

### CI/CD (GitHub Actions)

**Location**: `.github/workflows/ci.yml`

| Job | Purpose |
|-----|---------|
| `test-backend` | Run unit tests |
| `test-frontend` | Type check + build |
| `e2e-tests` | Playwright tests |
| `lint` | ESLint checks |

**Triggers**: Push/PR to `main`, `master`, `develop`

---

## License

MIT
