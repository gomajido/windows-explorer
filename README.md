# 📁 Windows Explorer Clone

> **Technical Documentation:** [TECHNICAL-SPESIFICATION-DOCUMENT.md](./TECHNICAL-SPESIFICATION-DOCUMENT.md)  
> **API Documentation:** http://localhost:3001/api/docs

---

## 🚀 Quick Start

### Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git**
- **Bun** 1.0+
- IDE with TypeScript support (VSCode, WebStorm, etc.)

---

### Setup Steps

```bash
# 1. Clone and enter directory
git clone <repository-url>
cd windows-explorer

# 2. Create environment files
cp be-elysia/.env.example be-elysia/.env
cp fe-vue/.env.example fe-vue/.env

# 3. Start Docker services
docker-compose up -d --build

# 4. Setup backend
cd be-elysia
bun install
bun run db:push
bun run db:seed

# 5. Setup frontend
cd ../fe-vue
bun install

# 6. Run tests (optional)
cd ../be-elysia && bun test
cd ../fe-vue && bun test src/__tests__
```

**Done!** Open http://localhost:8080

---

### ✅ Quick Verification

```bash
# Check services are running
docker ps

# Test API
curl http://localhost:3001/api/v1/folders/tree

# Test frontend
curl http://localhost:8080
```

---

## 🗄️ Database Management

### Initial Setup

```bash
cd be-elysia
bun install
bun run db:push
bun run db:seed
```

## 🧪 Testing

### Backend Tests (Unit + Integration)

```bash
cd be-elysia

# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test src/__tests__/usecases/GetFolderTree.test.ts
```

### Frontend Unit Tests

```bash
cd fe-vue

# Run unit tests
bun test src/__tests__

# Run with watch mode
bun test --watch
```

### Frontend E2E Tests (Playwright)

```bash
cd fe-vue

# First time: Install Playwright browsers
bunx playwright install

# Run E2E tests (headless)
bun run test:e2e

# Run with UI (interactive)
bun run test:e2e:ui

# Run with browser visible
bun run test:e2e:headed

# Run specific test file
bunx playwright test e2e/folder-navigation.spec.ts

# Generate test report
bunx playwright show-report
```

---

## 🔌 API Documentation

**Swagger UI:** http://localhost:3001/api/docs

All API endpoints, request/response formats, and interactive testing available via Swagger.

---

## ⚙️ Environment Variables

### Backend (.env)

```bash
# Database (Development)
DB_HOST=127.0.0.1
DB_PORT=3309
DB_USER=root
DB_PASSWORD=root
DB_NAME=folder_explorer

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Server
PORT=3001
NODE_ENV=development

# Production: Read/Write Split
DB_WRITE_HOST=mysql-master
DB_READ_HOST=mysql-replica
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001/api/v1
```

### Docker Environment

All configured in `docker-compose.yml` - no manual configuration needed for Docker deployment.

