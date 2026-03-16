import { test, expect } from '@playwright/test';

const BASE_URL = process.env.POMODORO_BASE_URL ?? 'http://localhost:5174/pomodoro/';

test.describe('FocusTimer Advanced Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    });

    test('displays basic stats placeholders', async ({ page }) => {
        await expect(page.locator('#stat-total-pomodoros')).toBeVisible();
        await expect(page.locator('#stat-total-pomodoros')).toHaveText('0');
        await expect(page.locator('#stat-today-time')).toHaveText('0h 0m');
    });

    test('keyboard shortcuts control the timer and focus', async ({ page }) => {
        const mainBtn = page.locator('#main-btn');
        await page.keyboard.press(' ');
        await expect(mainBtn).toHaveText('Pause');

        await page.keyboard.press(' ');
        await expect(mainBtn).toHaveText('Start');

        await page.keyboard.press('t');
        await expect(page.locator('#task-input')).toBeFocused();
    });

    test('allows task reordering via drag and drop', async ({ page }) => {
        await page.fill('#task-input', 'Task 1');
        await page.click('#add-task-form button[type="submit"]');
        await page.fill('#task-input', 'Task 2');
        await page.click('#add-task-form button[type="submit"]');

        const tasks = page.locator('.task-item');
        await expect(tasks).toHaveCount(2);
        await expect(tasks.nth(0)).toContainText('Task 1');
        await expect(tasks.nth(1)).toContainText('Task 2');

        await tasks.nth(1).locator('.task-content').dragTo(tasks.nth(0));
        await expect(tasks.nth(0)).toContainText('Task 2');
        await expect(tasks.nth(1)).toContainText('Task 1');
    });


    test('updates favicon when switching modes', async ({ page }) => {
        const initialFavicon = await page.locator("link[rel~='icon']").getAttribute('href');
        expect(initialFavicon).toContain('data:image/svg+xml');

        await page.click('button[data-mode="shortBreak"]');
        const breakFavicon = await page.locator("link[rel~='icon']").getAttribute('href');

        expect(breakFavicon).not.toBe(initialFavicon);
        expect(decodeURIComponent(breakFavicon ?? '')).toContain('#38858a');
    });

    test('attempts Picture-in-Picture when supported', async ({ page }) => {
        await page.addInitScript(() => {
            window.__pipCalled = false;
            const mockPiP = {
                requestWindow: async () => {
                    window.__pipCalled = true;
                    // Mock PiP window body with necessary elements for styles/task update
                    const pipBody = { 
                        append: () => { }, 
                        classList: { add: () => { } },
                        className: ''
                    };
                    return {
                        document: {
                            body: pipBody,
                            head: { appendChild: () => { } },
                            getElementById: (id) => id === 'pip-current-task' ? { textContent: '' } : null,
                            styleSheets: []
                        },
                        addEventListener: () => { },
                        close: () => { },
                    };
                }
            };
            Object.defineProperty(window, 'documentPictureInPicture', {
                value: mockPiP,
                configurable: true,
                writable: true
            });
        });

        await page.reload();
        await expect(page.locator('#pip-btn')).toBeVisible();
        await page.click('#pip-btn');
        await page.waitForFunction(() => window.__pipCalled === true, { timeout: 5000 });
        await expect(page.evaluate(() => window.__pipCalled)).resolves.toBe(true);
    });
});
