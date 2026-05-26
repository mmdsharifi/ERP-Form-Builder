import { test, expect } from '@playwright/test';

test.describe('ERP Form Builder E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (running locally on port 4000)
    await page.goto('/');
  });

  test('should load the page and allow binding the main panel to an entity', async ({ page }) => {
    // 1. Verify page has the main title (اطلاعات اصلی)
    await expect(page.locator('h3:has-text("اطلاعات اصلی")')).toBeVisible();

    // 2. Locate the connect entity select element inside MainPanel
    const select = page.locator('select').first();
    await expect(select).toBeVisible();

    // 3. Select 'sales_process' (روند فروش)
    await select.selectOption('sales_process');

    // 4. Verify loading state is shown, then bound entity badge is visible
    await expect(page.locator('text=در حال اتصال به موجودیت و همگام‌سازی فیلدها...')).toBeVisible();
    await page.waitForTimeout(1000); // wait for mock loading timeout of 800ms
    
    // 5. Verify the group has bound status badge and contains the bound field 'عنوان روند'
    await expect(page.locator('text=موجودیت: روند فروش')).toBeVisible();
    await expect(page.locator('text="عنوان روند"')).toBeVisible();
  });

  test('should support dragging and dropping fields, and editing properties', async ({ page }) => {
    // Bind main entity first (use sales_stages which has multiple fields)
    const select = page.locator('select').first();
    await select.selectOption('sales_stages');
    await page.waitForTimeout(1000);

    // Verify first field is loaded automatically
    await expect(page.locator('text="نام مراحل"')).toBeVisible();

    // Add a new group to have a clean drop zone
    const addGroupBtn = page.locator('text="افزودن گروه جدید"');
    await addGroupBtn.click();

    // Verify "گروه جدید" header is now visible (since groups > 1)
    await expect(page.locator('text="گروه جدید"')).toBeVisible();

    // Get the draggable "Text Field" (فیلد متنی) from Sidebar
    const draggableTextField = page.locator('text="فیلد متنی"');
    await expect(draggableTextField).toBeVisible();
    
    // Get the drop zone in the new group
    const dropZone = page.locator('div[class*="group/container"]:has-text("گروه جدید")').first();
    await expect(dropZone).toBeVisible();

    // Perform Drag and Drop
    await draggableTextField.dragTo(dropZone);

    // Verify the new field is added (next available field in sales_stages is 'احتمال موفقیت')
    const addedField = page.locator('text="احتمال موفقیت"');
    await expect(addedField).toBeVisible();

    // Click the field to open settings
    await addedField.click();

    // Verify the Settings Panel title shows "تنظیمات"
    await expect(page.locator('h2:has-text("تنظیمات")')).toBeVisible();

    // Locate the Helper Text field in settings and fill it
    const helperTextInput = page.locator('div:has(> label:has-text("متن راهنما (Helper Text)")) >> input');
    await helperTextInput.fill('توضیح راهنمای تستی');
    await helperTextInput.blur(); // Trigger blur to save

    // Verify that the helper text is rendered in the FormPanel
    const helperText = page.locator('p.sr-only:has-text("توضیح راهنمای تستی")');
    await expect(helperText).toBeVisible();
  });

  test('should enforce base group delete locks', async ({ page }) => {
    // Bind entity
    await page.locator('select').first().selectOption('sales_process');
    await page.waitForTimeout(1000);

    // Add another group to show headers (so groups.length > 1)
    await page.locator('text="افزودن گروه جدید"').click();

    // Select the "اطلاعات پایه" group header to focus it
    const baseGroupContainer = page.locator('div[class*="group/container"]:has-text("اطلاعات پایه")').first();
    await baseGroupContainer.click();

    // Verify that the trash button for g_base is not visible/not present
    const deleteGroupButton = baseGroupContainer.locator('button[title="حذف گروه"]');
    await expect(deleteGroupButton).not.toBeVisible();
  });

  test('should restrict Level 2 tab to Grid Table view only and hide viewType buttons', async ({ page }) => {
    // Get the Level 2 Tab "اقلام"
    const l2Tab = page.locator('text="اقلام"');
    await expect(l2Tab).toBeVisible();

    // Click it to select the tab
    await l2Tab.click();

    // In the SettingsPanel, we should verify that "نوع نمایش" toggles are hidden
    const viewTypeLabel = page.locator('text="نوع نمایش"');
    await expect(viewTypeLabel).not.toBeVisible();
  });

  test('should support editing the Main Panel title and sync it dynamically', async ({ page }) => {
    // 1. Click on the Main Panel to select it
    await page.locator('text="اطلاعات اصلی"').first().click();

    // 2. Locate the title input in SettingsPanel and fill it with a new value
    const titleInput = page.locator('div:has(label:has-text("عنوان پنل")) >> input');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('سند فروشگاهی جدید');
    await titleInput.blur();

    // 3. Verify that the Main Panel header title has updated
    await expect(page.locator('h3:has-text("سند فروشگاهی جدید")')).toBeVisible();
  });
});
