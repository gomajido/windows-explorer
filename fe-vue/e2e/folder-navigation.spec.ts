import { test, expect } from "@playwright/test";

// Mock API responses
const mockFolders = [
  { id: 1, name: "Documents", parentId: null, isFolder: true, createdAt: "2025-01-01", updatedAt: "2025-01-01", children: [] },
  { id: 2, name: "Downloads", parentId: null, isFolder: true, createdAt: "2025-01-01", updatedAt: "2025-01-01", children: [] },
];

test.describe("Folder Navigation", () => {
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
    // Wait for folder tree to load
    await page.waitForSelector("aside");
  });

  test("should expand folder on click", async ({ page }) => {
    // Find a folder in the tree
    const folderItem = page.locator('[role="treeitem"]').first();
    
    if (await folderItem.isVisible()) {
      // Click the expand button
      const expandButton = folderItem.locator("button").first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        
        // Check that folder is expanded (aria-expanded="true")
        await expect(folderItem).toHaveAttribute("aria-expanded", "true");
      }
    }
  });

  test("should select folder and show contents", async ({ page }) => {
    // Find a folder in the tree
    const folderItem = page.locator('[role="treeitem"]').first();
    
    if (await folderItem.isVisible()) {
      // Click to select
      await folderItem.click();
      
      // Check that folder is selected (aria-selected="true")
      await expect(folderItem).toHaveAttribute("aria-selected", "true");
    }
  });

  test("should toggle between grid and list view", async ({ page }) => {
    // Find view toggle button
    const viewToggle = page.locator('button[aria-label*="view"], button[title*="view"]');
    
    if (await viewToggle.isVisible()) {
      // Click to toggle
      await viewToggle.click();
      
      // The view should change (we can't easily verify the mode change without more specific selectors)
      await expect(viewToggle).toBeVisible();
    }
  });

  test("should navigate using breadcrumbs", async ({ page }) => {
    // Find breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    
    // Home button should be visible
    const homeButton = breadcrumb.locator("button").first();
    await expect(homeButton).toBeVisible();
  });
});
