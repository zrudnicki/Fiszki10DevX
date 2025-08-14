import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { CategoriesPage } from './page-objects/CategoriesPage';

test.describe('Categories CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('SC-CAT-01..04: create, list, edit, delete category', async ({ page }) => {
    const categories = new CategoriesPage(page);

    // go to list
    await categories.goto();

    // create
    const name = `E2E Kategoria ${Date.now()}`;
    await categories.createCategory(name);
    await categories.expectCategory(name);

    // edit
    const newName = name + ' (edyt)';
    await categories.editCategory(name, newName);
    await categories.expectCategory(newName);

    // delete
    await categories.deleteCategory(newName);
    await expect(page.getByText(newName)).toHaveCount(0);
  });
});





