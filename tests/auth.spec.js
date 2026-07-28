import { test, expect } from '@playwright/test';

const BASE_URL = process.env.POMODORO_BASE_URL ?? 'http://localhost:5174/pomodoro/';

test.describe('Auth Console Warnings Check', () => {
    test('no Cross-Origin-Opener-Policy warnings on load and modal toggle', async ({ page }) => {
        const coopWarnings = [];
        
        page.on('console', msg => {
            if (msg.text().includes('Cross-Origin-Opener-Policy')) {
                coopWarnings.push(msg.text());
            }
        });

        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Open Auth modal
        const authBtn = page.locator('#auth-btn');
        if (await authBtn.isVisible()) {
            await authBtn.click();
            await page.waitForTimeout(500);
        }

        // Verify zero COOP warnings were logged
        expect(coopWarnings).toEqual([]);
    });
});
