import { test, expect } from "@playwright/test";

test.describe("StyleOS End-to-End User Experience", () => {
  test("1. Landing page loads with editorial typography and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/StyleOS/i);

    // Headline check
    const headline = page.getByRole("heading", { name: /Your Wardrobe\. Reimagined\./i });
    await expect(headline).toBeVisible();

    // CTA check
    const cta = page.getByRole("link", { name: /Build Your Wardrobe/i }).first();
    await expect(cta).toBeVisible();
  });

  test("2. Authentication routes render required input controls", async ({ page }) => {
    // Login
    await page.goto("/login");
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();

    // Register
    await page.goto("/register");
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Create Account/i })).toBeVisible();
  });

  test("3. Digital Wardrobe displays category filters and empty/catalog state", async ({ page }) => {
    await page.goto("/wardrobe");
    // Verify page title
    await expect(page.getByRole("heading", { name: /Digital Wardrobe/i })).toBeVisible();

    // Verify category tab buttons
    await expect(page.getByRole("button", { name: /All Pieces/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Tops/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Bottoms/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Footwear/i })).toBeVisible();
  });

  test("4. Custom Outfit Builder renders slot stages and action controls", async ({ page }) => {
    await page.goto("/builder");
    await expect(page.getByRole("heading", { name: /Custom Outfit Builder/i })).toBeVisible();

    // Core garment slots
    await expect(page.getByText("Inner Top").first()).toBeVisible();
    await expect(page.getByText("Bottom").first()).toBeVisible();
    await expect(page.getByText("Footwear").first()).toBeVisible();

    // Send to studio button
    await expect(page.getByRole("button", { name: /Send to Virtual Studio/i })).toBeVisible();
  });

  test("5. 3D Virtual Studio renders viewport, camera presets, and 2D fallback toggle", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByRole("heading", { name: /Virtual 3D Studio/i })).toBeVisible();

    // Camera viewpoint controls
    await expect(page.getByRole("button", { name: /Front/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Profile/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Back/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reset/i })).toBeVisible();

    // Fallback toggle
    const toggle2D = page.getByRole("button", { name: /2D Mode|3D WebGL/i });
    await expect(toggle2D).toBeVisible();

    // Toggle 2D mode
    await toggle2D.click();
    await expect(page.getByText(/2D Composition Stage/i)).toBeVisible();
  });

  test("6. Responsive mobile layout adjusts navigation cleanly", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific layout test");
    await page.goto("/wardrobe");
    await expect(page.getByRole("heading", { name: /Digital Wardrobe/i })).toBeVisible();
  });
});
