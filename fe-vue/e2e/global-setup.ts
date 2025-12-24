import { test as setup } from "@playwright/test";

// Mock API responses for E2E tests
const mockFolders = [
  {
    id: 1,
    name: "Documents",
    parentId: null,
    isFolder: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    children: [],
  },
  {
    id: 2,
    name: "Downloads",
    parentId: null,
    isFolder: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    children: [],
  },
];

setup.beforeEach(async ({ page }) => {
  // Mock all API calls
  await page.route("**/api/v1/folders/**", async (route) => {
    const url = route.request().url();
    
    if (url.includes("/tree")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          httpCode: 200,
          message: "Success",
          code: "SUCCESS",
          data: mockFolders,
        }),
      });
    } else if (url.includes("/root/children") || url.includes("/children")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          httpCode: 200,
          message: "Success",
          code: "SUCCESS",
          data: mockFolders,
        }),
      });
    } else if (url.includes("/search")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          httpCode: 200,
          message: "Success",
          code: "SUCCESS",
          data: {
            data: mockFolders,
            cursor: { next: null, hasMore: false },
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          httpCode: 200,
          message: "Success",
          code: "SUCCESS",
          data: mockFolders[0],
        }),
      });
    }
  });
});

export { setup };
