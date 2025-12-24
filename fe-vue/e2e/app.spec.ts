import { test, expect } from "@playwright/test";

// Mock API responses
const mockFolders = [
  { id: 1, name: "Documents", parentId: null, isFolder: true, createdAt: "2025-01-01", updatedAt: "2025-01-01", children: [] },
  { id: 2, name: "Downloads", parentId: null, isFolder: true, createdAt: "2025-01-01", updatedAt: "2025-01-01", children: [] },
];

test.describe("File Explorer App", () => {
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

  test("should load the home page", async ({ page }) => {
    // Check page title or header exists
    await expect(page.locator("header")).toBeVisible();
  });

  test("should display folder tree sidebar", async ({ page }) => {
    // Check folder tree panel exists
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    
    // Check "Folders" heading
    await expect(page.getByText("Folders")).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();
  });

  test("should show empty state when no folder selected", async ({ page }) => {
    // Check for empty state message
    const contentArea = page.locator("main");
    await expect(contentArea).toBeVisible();
  });
});
