import type { Page } from '@playwright/test';

export class CategoriesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/categories');
    await this.page.waitForLoadState('networkidle');
  }

  async createCategory(name: string) {
    const newLink = this.page.getByRole('link', { name: 'Nowa kategoria' });
    await newLink.waitFor({ state: 'visible' });
    await newLink.click();
    const nameInput = this.page.getByLabel('Nazwa kategorii');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill(name);
    await this.page.getByRole('button', { name: 'Utwórz kategorię' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectCategory(name: string) {
    await this.page.getByText(name).waitFor({ state: 'visible' });
  }

  async editCategory(oldName: string, newName: string) {
    const row = this.page.locator('tr', { hasText: oldName });
    const editLink = row.getByRole('link', { name: 'Edytuj' });
    await editLink.waitFor({ state: 'visible' });
    await editLink.click();
    const input = this.page.getByLabel('Nazwa kategorii');
    await input.waitFor({ state: 'visible' });
    await input.fill('');
    await input.type(newName);
    await this.page.getByRole('button', { name: 'Zapisz zmiany' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async deleteCategory(name: string) {
    const row = this.page.locator('tr', { hasText: name });
    // accept confirm BEFORE clicking delete to avoid missing the event
    this.page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Usuń' }).click();
    // wait for the row to be removed from DOM
    await this.page.getByText(name).waitFor({ state: 'detached' });
  }
}



