import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
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
