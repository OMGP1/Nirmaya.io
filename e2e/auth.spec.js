import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 */

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('landing page loads correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/HealthBook/);
        await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible();
    });

    test('can navigate to login page', async ({ page }) => {
        await page.getByRole('link', { name: /Sign In/i }).click();
        await expect(page).toHaveURL('/login');
        await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible();
    });

    test('can navigate to register page', async ({ page }) => {
        await page.getByRole('link', { name: /Get Started/i }).click();
        await expect(page).toHaveURL('/register');
    });

    test('shows error for invalid login', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/Email/i).fill('invalid@test.com');
        await page.getByLabel(/Password/i).fill('wrongpassword');
        await page.getByRole('button', { name: /Sign In/i }).click();

        // Should show error message
        await expect(page.getByText(/Invalid/i)).toBeVisible({ timeout: 5000 });
    });

    test('login form validates required fields', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: /Sign In/i }).click();

        // Form should not submit without data
        await expect(page).toHaveURL('/login');
    });
});
