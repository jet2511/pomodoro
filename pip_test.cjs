const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('http://localhost:5175/pomodoro/');
    
    // add a task
    await page.fill('#task-input', 'Test Task 1');
    await page.click('.add-btn');
    
    // simulate pip layout in the main window
    await page.evaluate(() => {
        const timerSection = document.querySelector('.timer-section');
        const pipTaskEl = document.querySelector('#current-task-display');
        const timerDisplay = document.querySelector('.timer-display');
        
        timerDisplay.appendChild(pipTaskEl);
        
        document.body.innerHTML = '';
        document.body.appendChild(timerSection);
        document.body.className = 'pip-body mode-pomodoro';
        
        // inject pip CSS
        const pipStyle = document.createElement('style');
        pipStyle.textContent = `
        * { box-sizing: border-box !important; }
        
        body.pip-body {
            background-color: #ba4949 !important;
            margin: 0 !important;
            padding: 0 !important;
            display: grid !important;
            place-items: center !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            font-family: 'Inter', sans-serif !important;
            color: white !important;
        }
        
        .timer-section {
            width: 100% !important; 
            height: 100% !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: 1vmin !important;
            margin: 0 !important; 
            padding: 0 !important;
            background: transparent !important; 
            box-shadow: none !important; 
            border: none !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        .mode-selector, .status-text, .controls, .stats-section, .tasks-section, header { display: none !important; }
        
        .timer-display {
            position: relative !important; 
            width: 90vmin !important; 
            height: 90vmin !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            background: transparent !important;
            border: none !important;
            margin: 0 !important;
        }
        
        .progress-ring {
            position: absolute !important; 
            top: 50% !important; 
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-90deg) !important; 
            width: 100% !important; 
            height: 100% !important;
            pointer-events: none !important;
        }
        
        .time { 
            font-size: min(18vmin, 4.5rem) !important; 
            font-weight: 700 !important; 
            line-height: 1 !important;
            margin: 0 !important;
            padding-bottom: 6px !important;
            z-index: 10 !important;
            letter-spacing: -1.5px !important;
        }
        
        #current-task-display {
            font-size: min(4.5vmin, 0.85rem) !important; 
            max-width: 85% !important;
            margin-top: min(1.5vmin, 5px) !important;
            display: block !important;
        }

        @media (max-height: 160px), (max-width: 200px) {
            .progress-ring { display: none !important; }
            .timer-display { width: 100vw !important; height: 100vh !important; }
            .time { font-size: min(40vh, 20vw, 4rem) !important; margin-top: 0 !important; }
            #current-task-display { font-size: min(15vh, 8vw, 1.2rem) !important; margin-top: 5px !important; }
        }
        `;
        document.head.appendChild(pipStyle);
        pipTaskEl.textContent = 'Test Task 1';
        pipTaskEl.classList.add('has-task');
    });

    await page.setViewportSize({ width: 300, height: 300 });
    await page.screenshot({ path: 'C:/Users/tuyen/.gemini/antigravity/brain/b19a6d45-7990-495e-8b3f-3a19d68ed5da/scratch/pip-normal.png' });

    await page.setViewportSize({ width: 150, height: 150 });
    await page.screenshot({ path: 'C:/Users/tuyen/.gemini/antigravity/brain/b19a6d45-7990-495e-8b3f-3a19d68ed5da/scratch/pip-small.png' });

    await page.setViewportSize({ width: 300, height: 100 });
    await page.screenshot({ path: 'C:/Users/tuyen/.gemini/antigravity/brain/b19a6d45-7990-495e-8b3f-3a19d68ed5da/scratch/pip-wide.png' });

    await browser.close();
    console.log('Screenshots saved!');
})();