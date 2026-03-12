import { test, expect } from '@playwright/test';

test.describe('FocusTimer Advanced Features', () => {
    test.beforeEach(async ({ page }) => {
        // Expecting the server to be running on 8080
        await page.goto('http://localhost:8080');
    });

    test('should display total pomodoros in stats', async ({ page }) => {
        const totalPomodoros = page.locator('#stat-total-pomodoros');
        await expect(totalPomodoros).toBeVisible();
        await expect(totalPomodoros).toHaveText('0');
    });

    test('keyboard shortcuts should work', async ({ page }) => {
        // Space to start
        await page.keyboard.press(' ');
        const mainBtn = page.locator('#main-btn');
        await expect(mainBtn).toHaveText('Pause');

        // Space to pause
        await page.keyboard.press(' ');
        await expect(mainBtn).toHaveText('Start');

        // 'T' to focus task input
        await page.keyboard.press('t');
        const taskInput = page.locator('#task-input');
        await expect(taskInput).toBeFocused();
    });

    test('should allow task reordering via drag and drop', async ({ page }) => {
        // Add two tasks
        await page.fill('#task-input', 'Task 1');
        await page.click('#add-task-form button[type="submit"]');

        await page.fill('#task-input', 'Task 2');
        await page.click('#add-task-form button[type="submit"]');

        const tasks = page.locator('.task-item');
        await expect(tasks).toHaveCount(2);

        // Check initial order
        await expect(tasks.nth(0)).toContainText('Task 1');
        await expect(tasks.nth(1)).toContainText('Task 2');

        // Perform drag and drop (Task 2 to Task 1)
        const task2 = tasks.nth(1).locator('.task-content');
        const task1 = tasks.nth(0);

        await task2.dragTo(task1);

        // Verify new order
        await expect(tasks.nth(0)).toContainText('Task 2');
        await expect(tasks.nth(1)).toContainText('Task 1');
    });

    test('should toggle compact mode', async ({ page }) => {
        // Check initial state
        await expect(page.locator('body')).not.toHaveClass(/compact-mode/);

        // Toggle via button
        await page.click('#compact-btn');
        await expect(page.locator('body')).toHaveClass(/compact-mode/);

        // Toggle via keyboard 'C'
        await page.keyboard.press('c');
        await expect(page.locator('body')).not.toHaveClass(/compact-mode/);
    });

    test('should update favicon color on mode switch', async ({ page }) => {
        // Initial favicon (data URI)
        const initialFavicon = await page.locator("link[rel~='icon']").getAttribute('href');
        expect(initialFavicon).toContain('data:image/svg+xml');

        // Switch to Short Break
        await page.click('button[data-mode="shortBreak"]');
        const breakFavicon = await page.locator("link[rel~='icon']").getAttribute('href');

        expect(breakFavicon).not.toBe(initialFavicon);
        expect(decodeURIComponent(breakFavicon)).toContain('#38858a'); // Short break teal color
    });
});
