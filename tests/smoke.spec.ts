import { test, expect } from '@playwright/test';

test.describe('ERP Form Builder Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app (running locally on port 4000)
    await page.goto('/');
  });

  test('should load app layout and verify critical panels exist', async ({ page }) => {
    // Verify main app layout is loaded and default direction is RTL
    const outerContainer = page.locator('div[dir]');
    await expect(outerContainer).toHaveAttribute('dir', 'rtl');

    // Verify Header exists by checking the new form title in Persian
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=فرم جدید')).toBeVisible();

    // Verify Sidebar exists with Fields & Components label
    await expect(page.locator('aside')).toHaveCount(2); // Left sidebar and right settings panel both use <aside> or custom structure
    await expect(page.locator('text=اجزاء و فیلدها')).toBeVisible();

    // Verify Canvas (MainPanel) exists
    await expect(page.locator('h3:has-text("اطلاعات اصلی")')).toBeVisible();

    // Verify Settings Panel is loaded
    await expect(page.locator('text=المان را انتخاب کنید.')).toBeVisible();
  });

  test('should toggle language between Persian and English and switch layout direction', async ({ page }) => {
    const outerContainer = page.locator('div[dir]').first();
    await expect(outerContainer).toHaveAttribute('dir', 'rtl');

    // 1. Click "More Actions" (عملیات بیشتر) button in the header
    const moreActionsBtn = page.locator('button[title="عملیات بیشتر"]');
    await expect(moreActionsBtn).toBeVisible();
    await moreActionsBtn.click();

    // 2. Click English button
    const englishBtn = page.locator('button:has-text("English")');
    await expect(englishBtn).toBeVisible();
    await englishBtn.click();

    // 3. Verify language switch updates text & switches layout to LTR
    await expect(outerContainer).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('text=New Form')).toBeVisible();
    await expect(page.locator('text=Fields & Components')).toBeVisible();

    // 4. Click "More Actions" button again (now in English)
    const moreActionsBtnEn = page.locator('button[title="More Actions"]');
    await expect(moreActionsBtnEn).toBeVisible();
    await moreActionsBtnEn.click();

    // 5. Click Persian (فارسی) button
    const persianBtn = page.locator('button:has-text("فارسی")');
    await expect(persianBtn).toBeVisible();
    await persianBtn.click();

    // 6. Verify layout is back to RTL and Persian text is shown
    await expect(outerContainer).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('text=فرم جدید')).toBeVisible();
  });

  test('should toggle dark/light theme classes on the html element', async ({ page }) => {
    // Check initial dark mode state on html element
    const html = page.locator('html');
    const isInitiallyDark = await html.evaluate(el => el.classList.contains('dark'));

    // Open More Actions dropdown
    const moreActionsBtn = page.locator('button[title="عملیات بیشتر"]');
    await moreActionsBtn.click();

    // Toggle theme
    const themeToggleBtn = page.locator('button:has-text("پوسته")');
    await expect(themeToggleBtn).toBeVisible();
    await themeToggleBtn.click();

    // Verify theme state flipped
    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Toggle back to original state
    await themeToggleBtn.click();

    // Verify theme state flipped back
    if (isInitiallyDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });
});
