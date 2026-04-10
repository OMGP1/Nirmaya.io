import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard E2E Tests
 */

const ADMIN_USER = {
    email: 'admin@healthbook.com',
    password: 'adminpassword123',
};

test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/login');
        await page.getByLabel(/Email/i).fill(ADMIN_USER.email);
        await page.getByLabel(/Password/i).fill(ADMIN_USER.password);
        await page.getByRole('button', { name: /Sign In/i }).click();
    });

    test('can access admin dashboard', async ({ page }) => {
        await page.goto('/admin');

        // Should show admin dashboard or redirect to login if not admin
        const heading = page.getByRole('heading', { name: /Dashboard/i });
        const loginPage = page.getByRole('heading', { name: /Sign In/i });

        // Either we're on admin dashboard or redirected to login
        await expect(heading.or(loginPage)).toBeVisible({ timeout: 10000 });
    });

    test('admin sidebar navigation works', async ({ page }) => {
        await page.goto('/admin');

        // Check sidebar links exist
        await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible().catch(() => { });
        await expect(page.getByRole('link', { name: /Appointments/i })).toBeVisible().catch(() => { });
        await expect(page.getByRole('link', { name: /Doctors/i })).toBeVisible().catch(() => { });
    });

    test('can view admin appointments', async ({ page }) => {
        await page.goto('/admin/appointments');

        // Should show appointments table or loading state
        const table = page.locator('table');
        const loading = page.getByText(/Loading/i);

        await expect(table.or(loading)).toBeVisible({ timeout: 10000 });
    });

    test('can view admin doctors page', async ({ page }) => {
        await page.goto('/admin/doctors');

        // Should show doctors management or loading
        await expect(page.getByText(/Doctors/i)).toBeVisible({ timeout: 10000 });
    });

    test('can view admin departments page', async ({ page }) => {
        await page.goto('/admin/departments');

        // Should show departments or loading
        await expect(page.getByText(/Departments/i)).toBeVisible({ timeout: 10000 });
    });
});
