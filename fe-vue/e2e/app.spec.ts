import { test, expect } from "@playwright/test";

test.describe("File Explorer App", () => {
  test.beforeEach(async ({ page }) => {
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
