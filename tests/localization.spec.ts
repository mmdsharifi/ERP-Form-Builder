import { test, expect } from '@playwright/test';

test.describe('ERP Form Builder Localization and Layout RTL/LTR Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should correctly localize settings panel, canvas, sidebar and layouts when toggling language', async ({ page }) => {
    const outerContainer = page.locator('div[dir]').first();
    
    // 1. Initial State: Persian (RTL)
    await expect(outerContainer).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=فرم جدید')).toBeVisible();
    await expect(page.locator('text=اجزاء و فیلدها')).toBeVisible();
    await expect(page.locator('h3:has-text("اطلاعات اصلی")')).toBeVisible();
    await expect(page.locator('text=المان را انتخاب کنید.')).toBeVisible();

    // Bind main entity to load fields and open settings
    const entitySelect = page.locator('select').first();
    await entitySelect.selectOption('sales_stages');
    await page.waitForTimeout(500);

    // Verify first field is loaded automatically
    const fieldNode = page.locator('text="نام مراحل"');
    await expect(fieldNode).toBeVisible();
    await fieldNode.click();

    // Verify the Settings Panel title shows "تنظیمات" in Persian
    await expect(page.locator('h2:has-text("تنظیمات")')).toBeVisible();
    
    // Check Persian labels in settings panel
    await expect(page.locator('text=اتصال داده')).toBeVisible();
    await expect(page.locator('text=اعتبارسنجی و دسترسی')).toBeVisible();
    await expect(page.locator('text=ظاهر و چیدمان')).toBeVisible();
    await expect(page.locator('text=تنظیمات اختصاصی')).toBeVisible();

    // 2. Toggle to English
    const moreActionsBtn = page.locator('button[title="عملیات بیشتر"]');
    await moreActionsBtn.click();
    
    const englishBtn = page.locator('button:has-text("English")');
    await englishBtn.click();

    // Verify layout direction updates to LTR
    await expect(outerContainer).toHaveAttribute('dir', 'ltr');

    // Verify English text in Header, Sidebar and Canvas
    await expect(page.locator('text=New Form')).toBeVisible();
    await expect(page.locator('text=Fields & Components')).toBeVisible();
    await expect(page.locator('h3:has-text("Main Panel")')).toBeVisible();

    // Verify Settings Panel is now in English
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();
    await expect(page.locator('text=Data Binding')).toBeVisible();
    await expect(page.locator('text=Access & Validation')).toBeVisible();
    await expect(page.locator('text=Layout & Appearance')).toBeVisible();
    await expect(page.locator('text=Specialized Settings')).toBeVisible();

    // Check specific fields settings labels are in English
    await expect(page.locator('text=Visible')).toBeVisible();
    await expect(page.locator('text=Required')).toBeVisible();
    await expect(page.locator('text=Editable')).toBeVisible();
    await expect(page.locator('text=Helper Text')).toBeVisible();
    await expect(page.locator('text=Character Length Limits')).toBeVisible();
    await expect(page.locator('text=Default Values')).toBeVisible();

    // Click "Items" tab (Level 2 tab) and verify it translated to "Items"
    const itemsTab = page.locator('div[class*="cursor-pointer"]:has-text("Items")').first();
    await expect(itemsTab).toBeVisible();
    await itemsTab.click();

    // Bind L2 tab to sales_stages
    const l2Select = page.locator('main select');
    await expect(l2Select).toBeVisible();
    await l2Select.selectOption('sales_stages');
    await page.waitForTimeout(500);

    // Verify grid headers and buttons are in English
    await expect(page.locator('text="Stage Name"')).toBeVisible();
    await expect(page.getByRole('button', { name: 'New', exact: true })).toBeVisible();
    await expect(page.locator('button:has-text("Add Summary Row")')).toBeVisible();

    // 3. Toggle back to Persian (فارسی)
    const moreActionsBtnEn = page.locator('button[title="More Actions"]');
    await moreActionsBtnEn.click();

    const persianBtn = page.locator('button:has-text("فارسی")');
    await persianBtn.click();

    // Verify layout switches back to RTL
    await expect(outerContainer).toHaveAttribute('dir', 'rtl');

    // Verify Farsi text is restored
    await expect(page.locator('text=فرم جدید')).toBeVisible();
    await expect(page.locator('text=اجزاء و فیلدها')).toBeVisible();
    await expect(page.locator('h3:has-text("اطلاعات اصلی")')).toBeVisible();
  });
});
