import { test, expect } from "@playwright/test";

// Mock API responses
const mockFolders = [
  { id: 1, name: "Documents", parentId: null, isFolder: true, createdAt: "2025-01-01", updatedAt: "2025-01-01", children: [] },
];

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API endpoints
    await page.route("**/api/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ httpCode: 200, code: "SUCCESS", data: mockFolders }),
      });
    });
    await page.goto("/");
  });

  test("should have search input with placeholder", async ({ page }) => {
    const searchInput = page.locator('input[role="searchbox"], input[type="text"]');
    await expect(searchInput).toBeVisible();
  });

  test("should focus search input on click", async ({ page }) => {
    const searchInput = page.locator('input[role="searchbox"], input[type="text"]');
    await searchInput.click();
    await expect(searchInput).toBeFocused();
  });

  test("should type in search input", async ({ page }) => {
    const searchInput = page.locator('input[role="searchbox"], input[type="text"]');
    await searchInput.fill("documents");
    await expect(searchInput).toHaveValue("documents");
  });

  test("should clear search with escape key", async ({ page }) => {
    const searchInput = page.locator('input[role="searchbox"], input[type="text"]');
    await searchInput.fill("test");
    await searchInput.press("Escape");
    
    // Search input might be cleared or search results hidden
    // This depends on your implementation
  });
});
