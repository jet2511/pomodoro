import { test, expect } from '@playwright/test';

const BASE_URL = process.env.POMODORO_BASE_URL ?? 'http://localhost:5174/pomodoro/';

test.describe('FocusTimer Advanced Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            try { localStorage.clear(); } catch (_) {}
        });
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
        await page.locator('#task-input').blur();
    });

    test('keyboard shortcut c opens and closes settings modal', async ({ page }) => {
        const settingsModal = page.locator('#settings-modal');
        await expect(settingsModal).toHaveClass(/hidden/);

        await page.keyboard.press('c');
        await expect(settingsModal).not.toHaveClass(/hidden/);

        await page.keyboard.press('Escape');
        await expect(settingsModal).toHaveClass(/hidden/);
    });

    test('allows task reordering via drag and drop', async ({ page }) => {
        await page.locator('#task-input').click();
        await page.locator('#task-input').fill('Task 1');
        await page.locator('#task-input').press('Enter');
        await expect(page.locator('.task-item')).toHaveCount(1);

        await page.locator('#task-input').click();
        await page.locator('#task-input').fill('Task 2');
        await page.locator('#task-input').press('Enter');
        await expect(page.locator('.task-item')).toHaveCount(2);

        const tasks = page.locator('.task-item');
        await expect(tasks.nth(0)).toContainText('Task 1');
        await expect(tasks.nth(1)).toContainText('Task 2');

        await page.evaluate(() => {
            const items = document.querySelectorAll('.task-item');
            if (items.length >= 2) {
                items[1].dispatchEvent(new Event('dragstart', { bubbles: true }));
                items[0].dispatchEvent(new Event('drop', { bubbles: true }));
                items[1].dispatchEvent(new Event('dragend', { bubbles: true }));
            }
        });
        await expect(page.locator('.task-item').nth(0)).toContainText('Task 2');
        await expect(page.locator('.task-item').nth(1)).toContainText('Task 1');
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

    test('creates task with category and shows category badge', async ({ page }) => {
        // Can create with Quick Add directly
        await page.locator('#task-input').fill('Finish report');
        await page.locator('#task-input').press('Enter');

        const taskItem = page.locator('.task-item').first();
        await expect(taskItem).toBeVisible();
        await expect(taskItem).toContainText('Finish report');
        await expect(taskItem.locator('.task-category-badge')).toContainText('General');
    });

    test('switches task category using inline category picker popover', async ({ page }) => {
        await page.locator('#task-input').fill('Code review task');
        await page.locator('#task-input').press('Enter');

        const taskItem = page.locator('.task-item').first();
        const badge = taskItem.locator('.task-category-badge');
        await expect(badge).toContainText('General');

        // Click badge to open popover
        await badge.click();
        const popover = page.locator('.category-picker-popover');
        await expect(popover).toBeVisible();

        // Select 'Work'
        await popover.locator('.category-picker-item', { hasText: 'Work' }).click();
        await expect(popover).not.toBeVisible();
        await expect(badge).toContainText('Work');
    });

    test('filters task list when clicking category filter pills', async ({ page }) => {
        // Click Work filter first, then add task -> auto inherits Work
        await page.locator('button.category-filter-btn[data-category-id="cat_work"]').click();
        await page.locator('#task-input').fill('Work Task');
        await page.locator('#task-input').press('Enter');

        // Click Study filter, then add task -> auto inherits Study
        await page.locator('button.category-filter-btn[data-category-id="cat_study"]').click();
        await page.locator('#task-input').fill('Study Task');
        await page.locator('#task-input').press('Enter');

        // Only Study task visible currently
        await expect(page.locator('.task-item')).toHaveCount(1);
        await expect(page.locator('.task-item').first()).toContainText('Study Task');

        // Click Work filter
        await page.locator('button.category-filter-btn[data-category-id="cat_work"]').click();
        await expect(page.locator('.task-item')).toHaveCount(1);
        await expect(page.locator('.task-item').first()).toContainText('Work Task');

        // Click All filter
        await page.locator('button.category-filter-btn', { hasText: 'All' }).click();
        await expect(page.locator('.task-item')).toHaveCount(2);
    });

    test('adds a new custom category through category modal with live preview', async ({ page }) => {
        await page.locator('.category-filter-add-btn').click();
        const categoryModal = page.locator('#category-modal');
        await expect(categoryModal).not.toHaveClass(/hidden/);

        // Check Live Preview updates
        const previewBadge = page.locator('#category-preview-badge');
        await expect(previewBadge).toContainText('New Category');

        await page.locator('#category-name-input').fill('Design Project');
        await expect(previewBadge).toContainText('Design Project');

        await page.locator('#category-save-btn').click();

        await expect(categoryModal).toHaveClass(/hidden/);
        await expect(page.locator('button.category-filter-btn', { hasText: 'Design Project' })).toBeVisible();
    });

    test('archives task, opens archive modal, searches, restores task, and permanently deletes task', async ({ page }) => {
        // Add a task
        await page.locator('#task-input').fill('Task to Archive');
        await page.locator('#task-input').press('Enter');
        await expect(page.locator('.task-item')).toHaveCount(1);
        await expect(page.locator('.task-item').first()).toContainText('Task to Archive');

        // Check initial badge on header
        const badge = page.locator('#archive-count-badge');
        await expect(badge).toHaveText('0');

        // Click Archive button on active task item
        const archiveBtn = page.locator('.task-item').first().locator('.archive-btn');
        await expect(archiveBtn).toBeVisible();
        await archiveBtn.click();

        // Task disappears from active list
        await expect(page.locator('.task-item')).toHaveCount(0);

        // Badge updates to 1
        await expect(badge).toHaveText('1');

        // Category filter should NOT contain an 'Archived' button
        await expect(page.locator('button.category-filter-btn[data-category-id="archived"]')).toHaveCount(0);

        // Open archive modal via #open-archive-btn
        const openArchiveBtn = page.locator('#open-archive-btn');
        await openArchiveBtn.click();

        const archiveModal = page.locator('#archive-modal');
        await expect(archiveModal).not.toHaveClass(/hidden/);

        // Check task is inside modal
        const archivedItem = archiveModal.locator('.archive-task-item').first();
        await expect(archivedItem).toBeVisible();
        await expect(archivedItem).toContainText('Task to Archive');

        // Test search filter in modal
        const searchInput = page.locator('#archive-search-input');
        await searchInput.fill('NonExistent');
        await expect(archiveModal.locator('.archive-task-item')).toHaveCount(0);
        await expect(archiveModal.locator('.archive-empty-state')).toBeVisible();

        await searchInput.fill('Task to Archive');
        await expect(archiveModal.locator('.archive-task-item')).toHaveCount(1);

        // Test Restore
        const restoreBtn = archivedItem.locator('.restore-btn');
        await restoreBtn.click();

        // Inside modal it should now be empty
        await expect(archiveModal.locator('.archive-task-item')).toHaveCount(0);
        await expect(badge).toHaveText('0');

        // Close modal
        await page.locator('#close-archive-btn').click();
        await expect(archiveModal).toHaveClass(/hidden/);

        // Task is back in active list!
        await expect(page.locator('.task-item')).toHaveCount(1);
        await expect(page.locator('.task-item').first()).toContainText('Task to Archive');

        // Archive again to test Permanent Delete
        await page.locator('.task-item').first().locator('.archive-btn').click();
        await expect(badge).toHaveText('1');

        // Open modal
        await openArchiveBtn.click();
        await expect(archiveModal).not.toHaveClass(/hidden/);

        // Click Permanent Delete
        const confirmDialog = page.locator('#confirm-modal');
        await archiveModal.locator('.delete-permanent-btn').first().click();
        await expect(confirmDialog).not.toHaveClass(/hidden/);
        await page.locator('#confirm-ok-btn').click();

        // Task should be permanently deleted from modal
        await expect(archiveModal.locator('.archive-task-item')).toHaveCount(0);
        await expect(badge).toHaveText('0');
        await expect(archiveModal.locator('.archive-empty-state')).toContainText('Chưa có công việc nào được lưu trữ.');

        // Close modal and verify active list is also empty
        await page.locator('#close-archive-btn').click();
        await expect(page.locator('.task-item')).toHaveCount(0);
    });
});


