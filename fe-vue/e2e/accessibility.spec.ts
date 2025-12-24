import { test, expect } from "@playwright/test";

// Mock API responses
const mockFolders = [
  { id: 1, name: "Documents", parentId: null, isFolder: true, createdAt: "2025-01-01", updatedAt: "2025-01-01", children: [] },
];

test.describe("Accessibility", () => {
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

  test("should have proper ARIA roles", async ({ page }) => {
    // Check main landmarks
    await expect(page.locator('[role="banner"]')).toBeVisible(); // header
    await expect(page.locator('[role="navigation"]')).toBeVisible(); // sidebar
    await expect(page.locator('[role="main"]')).toBeVisible(); // main content
  });

  test("should have accessible folder tree", async ({ page }) => {
    // Check tree role
    const tree = page.locator('[role="tree"]');
    await expect(tree).toBeVisible();
    
    // Check tree has label
    await expect(tree).toHaveAttribute("aria-labelledby");
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press("Tab");
    
    // Something should be focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have visible focus indicators", async ({ page }) => {
    // Tab to an element
    await page.keyboard.press("Tab");
    
    // The focused element should have a visible focus ring
    const focusedElement = page.locator(":focus");
    
    if (await focusedElement.isVisible()) {
      // Check that element has focus styles (ring)
      const hasRing = await focusedElement.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outlineWidth !== "0px" || styles.boxShadow.includes("rgb");
      });
      
      // Focus indicator should be present
      expect(hasRing).toBeTruthy();
    }
  });
});
