# Contributing Guide

## Project Structure

This is a monorepo with Clean Architecture:

```
windows-explorer/
├── be-elysia/          # Backend (Elysia.js + Bun)
│   └── src/
│       ├── domain/         # Entities, Interfaces
│       ├── application/    # Use Cases
│       ├── infrastructure/ # Database, Cache
│       └── presentation/   # Routes, Middleware
│
└── fe-vue/             # Frontend (Vue 3 + TypeScript)
    └── src/
        ├── domain/         # Types
        ├── application/    # Services, Composables
        ├── infrastructure/ # API Client
        └── presentation/   # Pages, Components
```

## Development Setup

```bash
# Install dependencies
bun install

# Start Docker services
docker-compose up -d

# Run database migrations
cd be-elysia && bun run db:push

# Seed database
bun run db:seed

# Start development
bun run dev
```

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types
- All functions must have return types
- Use interfaces for contracts

### Clean Architecture Rules
1. **Domain** - No external dependencies
2. **Application** - Depends only on Domain
3. **Infrastructure** - Implements Domain interfaces
4. **Presentation** - Depends on Application

### Testing
```bash
# Run all tests
bun run test

# Run backend tests only
bun run test:be

# Run frontend tests only
bun run test:fe
```

### Commit Messages
Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests

## Pull Request Process

1. Create feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description
