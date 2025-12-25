# UI Component Testing Guide

## Current Test Coverage

### ✅ Existing Tests
- **Backend Unit Tests**: 1 test file
  - `be-elysia/src/__tests__/usecases/GetFolderTree.test.ts`
- **Frontend Service Tests**: 1 test file  
  - `fe-vue/src/__tests__/services/FolderService.test.ts`
- **E2E Tests**: 4 test files
  - `fe-vue/e2e/app.spec.ts`
  - `fe-vue/e2e/folder-navigation.spec.ts`
  - `fe-vue/e2e/search.spec.ts`
  - `fe-vue/e2e/accessibility.spec.ts`

### ❌ Missing Component Tests
- FolderTreeNode.vue
- ContentPanel.vue
- Toolbar.vue
- Breadcrumb.vue
- SearchResults.vue
- FileItem.vue
- ErrorToast.vue
- SkeletonLoader.vue

## Test Setup Required

### 1. Install Testing Dependencies

```bash
cd fe-vue
bun add -D @vue/test-utils@latest vitest@latest jsdom@latest
```

### 2. Create Vitest Config

```typescript
// fe-vue/vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Create Test Setup File

```typescript
// fe-vue/src/__tests__/setup.ts
import { config } from '@vue/test-utils';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Global test config
config.global.stubs = {
  teleport: true,
};
```

## Component Test Templates

### Template 1: FolderTreeNode Component

```typescript
// fe-vue/src/__tests__/components/FolderTreeNode.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FolderTreeNode from '../../presentation/components/FolderTreeNode.vue';

describe('FolderTreeNode', () => {
  const mockNode = {
    id: 1,
    name: 'Documents',
    parentId: null,
    isFolder: true,
    createdAt: '2025-12-22T00:00:00.000Z',
    updatedAt: '2025-12-22T00:00:00.000Z',
    children: [],
    isLoaded: true,
    isExpanding: false,
  };

  it('renders folder name', () => {
    const wrapper = mount(FolderTreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        expandedIds: [],
        level: 0,
      },
    });
    expect(wrapper.text()).toContain('Documents');
  });

  it('emits select event on click', async () => {
    const wrapper = mount(FolderTreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        expandedIds: [],
        level: 0,
      },
    });
    await wrapper.find('.folder-row').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
  });

  it('applies selected styling', () => {
    const wrapper = mount(FolderTreeNode, {
      props: {
        node: mockNode,
        selectedId: 1,
        expandedIds: [],
        level: 0,
      },
    });
    expect(wrapper.find('.folder-row').classes()).toContain('bg-blue-100');
  });

  it('handles keyboard navigation', async () => {
    const wrapper = mount(FolderTreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        expandedIds: [],
        level: 0,
      },
    });
    await wrapper.find('.folder-row').trigger('keydown.enter');
    expect(wrapper.emitted('select')).toBeTruthy();
  });
});
```

### Template 2: ContentPanel Component

```typescript
// fe-vue/src/__tests__/components/ContentPanel.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContentPanel from '../../presentation/components/ContentPanel.vue';

describe('ContentPanel', () => {
  const mockFolder = {
    id: 1,
    name: 'Documents',
    parentId: null,
    isFolder: true,
    createdAt: '2025-12-22T00:00:00.000Z',
    updatedAt: '2025-12-22T00:00:00.000Z',
  };

  it('renders in grid view', () => {
    const wrapper = mount(ContentPanel, {
      props: {
        selectedFolder: mockFolder,
        children: [mockFolder],
        isLoading: false,
        viewMode: 'grid',
      },
    });
    expect(wrapper.find('.grid').exists()).toBe(true);
  });

  it('renders in list view', () => {
    const wrapper = mount(ContentPanel, {
      props: {
        selectedFolder: mockFolder,
        children: [mockFolder],
        isLoading: false,
        viewMode: 'list',
      },
    });
    expect(wrapper.find('.list').exists()).toBe(true);
  });

  it('shows loading skeleton', () => {
    const wrapper = mount(ContentPanel, {
      props: {
        selectedFolder: mockFolder,
        children: [],
        isLoading: true,
        viewMode: 'grid',
      },
    });
    expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state', () => {
    const wrapper = mount(ContentPanel, {
      props: {
        selectedFolder: mockFolder,
        children: [],
        isLoading: false,
        viewMode: 'grid',
      },
    });
    expect(wrapper.text()).toMatch(/empty|no items/i);
  });
});
```

### Template 3: SearchResults Component

```typescript
// fe-vue/src/__tests__/components/SearchResults.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchResults from '../../presentation/components/SearchResults.vue';

describe('SearchResults', () => {
  const mockResults = [
    {
      id: 1,
      name: 'Document.pdf',
      parentId: null,
      isFolder: false,
      createdAt: '2025-12-22T00:00:00.000Z',
      updatedAt: '2025-12-22T00:00:00.000Z',
    },
  ];

  it('renders search results', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: mockResults,
        query: 'Document',
        isLoading: false,
      },
    });
    expect(wrapper.text()).toContain('Document.pdf');
  });

  it('shows result count', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: mockResults,
        query: 'Document',
        isLoading: false,
      },
    });
    expect(wrapper.text()).toMatch(/1.*result/i);
  });

  it('emits select event', async () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: mockResults,
        query: 'Document',
        isLoading: false,
      },
    });
    await wrapper.find('[data-result-item]').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
  });
});
```

## Testing Best Practices

### 1. **Test User Behavior, Not Implementation**
```typescript
// ❌ Bad - Testing implementation
expect(wrapper.vm.internalState).toBe(true);

// ✅ Good - Testing user-visible behavior
expect(wrapper.find('.selected').exists()).toBe(true);
```

### 2. **Use Semantic Selectors**
```typescript
// ❌ Bad - Fragile class selectors
wrapper.find('.btn-primary-lg-blue');

// ✅ Good - Semantic selectors
wrapper.find('button[aria-label="Save"]');
wrapper.find('[data-testid="save-button"]');
```

### 3. **Test Accessibility**
```typescript
it('has correct ARIA attributes', () => {
  const wrapper = mount(Component);
  expect(wrapper.attributes('role')).toBe('button');
  expect(wrapper.attributes('aria-label')).toBeTruthy();
});
```

### 4. **Test Keyboard Navigation**
```typescript
it('handles Enter key', async () => {
  const wrapper = mount(Component);
  await wrapper.trigger('keydown.enter');
  expect(wrapper.emitted('submit')).toBeTruthy();
});
```

### 5. **Mock External Dependencies**
```typescript
import { vi } from 'vitest';

vi.mock('../../infrastructure/api/FolderApi', () => ({
  FolderApi: {
    getTree: vi.fn().mockResolvedValue([]),
  },
}));
```

## Running Tests

```bash
# Run all tests
bun test

# Run component tests only
bun test src/__tests__/components

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch

# Run specific test file
bun test FolderTreeNode.test.ts
```

## Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Backend Use Cases | 10% | 80% |
| Frontend Services | 20% | 80% |
| UI Components | 0% | 70% |
| E2E Tests | ✅ Good | Maintain |

## Priority Test List

### High Priority (Core Functionality)
1. ✅ FolderService - Already exists
2. ⬜ FolderTreeNode - Navigation critical
3. ⬜ ContentPanel - Main content display
4. ⬜ SearchResults - Search functionality

### Medium Priority (User Experience)
5. ⬜ Toolbar - Actions and view modes
6. ⬜ Breadcrumb - Navigation aid
7. ⬜ FileItem - File display

### Low Priority (Polish)
8. ⬜ ErrorToast - Error handling
9. ⬜ SkeletonLoader - Loading states
10. ⬜ ErrorBoundary - Error recovery

## Common Testing Patterns

### Pattern 1: Testing Emitted Events
```typescript
it('emits event with correct payload', async () => {
  const wrapper = mount(Component);
  await wrapper.find('button').trigger('click');
  
  expect(wrapper.emitted('action')).toBeTruthy();
  expect(wrapper.emitted('action')?.[0]).toEqual([expectedPayload]);
});
```

### Pattern 2: Testing Conditional Rendering
```typescript
it('shows content when loaded', async () => {
  const wrapper = mount(Component, {
    props: { isLoading: false },
  });
  expect(wrapper.find('.content').exists()).toBe(true);
  expect(wrapper.find('.skeleton').exists()).toBe(false);
});
```

### Pattern 3: Testing Async Operations
```typescript
it('loads data on mount', async () => {
  const wrapper = mount(Component);
  await wrapper.vm.$nextTick();
  
  expect(wrapper.text()).toContain('Loaded Data');
});
```

## Troubleshooting

### Issue: "Cannot find module '@vue/test-utils'"
**Solution**: Install dependencies
```bash
bun add -D @vue/test-utils vitest jsdom
```

### Issue: "window is not defined"
**Solution**: Set environment to jsdom in vitest.config.ts
```typescript
test: {
  environment: 'jsdom',
}
```

### Issue: "Component styles not applied"
**Solution**: Import component styles in test or use shallow mount

### Issue: "Async test timing out"
**Solution**: Use `await wrapper.vm.$nextTick()` or increase timeout

## Next Steps

1. **Set up Vitest** - Configure testing environment
2. **Create test helpers** - Shared mocks and utilities
3. **Write component tests** - Start with high-priority components
4. **Add coverage reporting** - Track progress
5. **Integrate CI/CD** - Run tests on every commit

## Resources

- [Vue Test Utils Docs](https://test-utils.vuejs.org/)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
