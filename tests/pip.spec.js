import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174/pomodoro/';

test.describe('PiP Shortcuts', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    });

    test('keyboard shortcuts work in PiP mode', async ({ page }) => {
        // Only run in chromium as Document PiP is mostly Chromium-only for now
        test.skip(page.context().browser().browserType().name() !== 'chromium', 'Document PiP is Chromium only');
        
        // Wait for page to initialize
        await page.waitForTimeout(1000);
        
        // Expose a function to capture PiP window
        await page.evaluate(() => {
            window.pipTestingWindow = null;
            const originalRequestWindow = window.documentPictureInPicture.requestWindow;
            window.documentPictureInPicture.requestWindow = async function(...args) {
                const pipWin = await originalRequestWindow.apply(this, args);
                window.pipTestingWindow = pipWin;
                return pipWin;
            };
        });

        // Click PiP button
        await page.evaluate(() => document.getElementById('pip-btn').style.display = 'block');
        await page.click('#pip-btn');
        
        // Wait for PiP window to open and content to inject
        await page.waitForTimeout(1000);
        
        const isPipOpen = await page.evaluate(() => window.pipTestingWindow && !window.pipTestingWindow.closed);
        expect(isPipOpen).toBeTruthy();
        
        // Check if timer starts on Space in PiP
        const isRunningBefore = await page.evaluate(() => window.pipTestingWindow.document.querySelector('.timer-display').classList.contains('is-running'));
        expect(isRunningBefore).toBeFalsy();
        
        // Dispatch Space key on PiP window document
        await page.evaluate(() => {
            const event = new KeyboardEvent('keydown', { code: 'Space' });
            window.pipTestingWindow.document.dispatchEvent(event);
        });
        
        await page.waitForTimeout(500); // Wait for toggleTimer async import and UI update
        
        const isRunningAfter = await page.evaluate(() => window.pipTestingWindow.document.querySelector('.timer-display').classList.contains('is-running'));
        expect(isRunningAfter).toBeTruthy();
        
        // Dispatch S key on PiP window document
        const modeBefore = await page.evaluate(() => document.body.className);
        await page.evaluate(() => {
            const event = new KeyboardEvent('keydown', { key: 's' });
            window.pipTestingWindow.document.dispatchEvent(event);
        });
        
        await page.waitForTimeout(500);
        
        const modeAfter = await page.evaluate(() => document.body.className);
        expect(modeAfter).not.toBe(modeBefore); // Mode should change
        
        // Dispatch P key on PiP window document
        await page.evaluate(() => {
            const event = new KeyboardEvent('keydown', { key: 'p' });
            window.pipTestingWindow.document.dispatchEvent(event);
        });
        
        await page.waitForTimeout(500);
        
        const isPipClosed = await page.evaluate(() => !window.pipTestingWindow || window.pipTestingWindow.closed);
        expect(isPipClosed).toBeTruthy();
    });
});
