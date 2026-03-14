import { elements } from './elements.js';

let pipWindow = null;
let timerParent = null;

export function isPiPSupported() {
    return 'documentPictureInPicture' in window;
}

export function initPiP() {
    if (isPiPSupported()) {
        const pipBtn = document.getElementById('pip-btn');
        if (pipBtn) pipBtn.style.display = 'block';
    }
}

export async function togglePiP() {
    if (pipWindow) {
        pipWindow.close();
        return;
    }

    try {
        const timerSection = document.querySelector('.timer-section');
        if (!timerSection) {
            console.error('Timer section not found');
            return;
        }

        pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 320,
            height: 380,
        });

        // Copy styles
        copyStyles(pipWindow);

        timerParent = timerSection.parentNode;
        const nextSibling = timerSection.nextSibling;

        pipWindow.document.body.append(timerSection);
        pipWindow.document.body.classList.add('pip-body');

        const updatePipTheme = () => {
            if (pipWindow) {
                const currentMode = document.body.className.split(' ').find(c => c.startsWith('mode-')) || 'mode-pomodoro';
                pipWindow.document.body.className = `pip-body ${currentMode}`;
            }
        };
        updatePipTheme();

        const observer = new MutationObserver(updatePipTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        pipWindow.addEventListener('pagehide', () => {
            pipWindow = null;
            observer.disconnect();
            if (timerParent && timerSection) {
                if (nextSibling) {
                    timerParent.insertBefore(timerSection, nextSibling);
                } else {
                    timerParent.appendChild(timerSection);
                }
            }
        });

    } catch (err) {
        console.error('PiP failed:', err);
    }
}

function copyStyles(targetWindow) {
    [...document.styleSheets].forEach((styleSheet) => {
        try {
            if (styleSheet.cssRules) {
                const style = document.createElement('style');
                style.textContent = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                targetWindow.document.head.appendChild(style);
            }
        } catch (e) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            targetWindow.document.head.appendChild(link);
        }
    });

    // Add forced overrides
    const pipStyle = document.createElement('style');
    pipStyle.textContent = `
        :root {
            --clr-bg-pomodoro: #ba4949;
            --clr-bg-short: #38858a;
            --clr-bg-long: #397097;
            --clr-text: #ffffff;
        }
        body.pip-body {
            background-color: var(--clr-bg-pomodoro) !important;
            margin: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            height: 100vh !important;
            overflow: hidden !important;
            font-family: sans-serif;
            color: white !important;
        }
        body.pip-body.mode-shortBreak { background-color: var(--clr-bg-short) !important; }
        body.pip-body.mode-longBreak { background-color: var(--clr-bg-long) !important; }
        
        .timer-section {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            transform: scale(0.9);
        }
        .mode-selector, .status-text { display: none !important; }
        .timer-display {
            position: relative !important;
            width: 250px !important;
            height: 250px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin-bottom: 1rem !important;
        }
        .progress-ring {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            transform: rotate(-90deg) !important;
        }
        .time { 
            font-size: 4rem !important; 
            font-weight: bold !important; 
            color: white !important;
            z-index: 10 !important;
        }
        .controls { display: flex !important; gap: 10px !important; }
        .control-btn { border-radius: 50px !important; border: none !important; cursor: pointer !important; }
        .control-btn.primary { background: white !important; color: #333 !important; padding: 10px 30px !important; font-weight: bold !important; }
        .control-btn.secondary { 
            background: rgba(255, 255, 255, 0.2) !important; 
            color: white !important;
            width: 45px !important;
            height: 45px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
        }
        #pip-current-task {
            margin-top: 1.5rem !important;
            font-size: 1.1rem !important;
            font-weight: 500 !important;
            color: rgba(255, 255, 255, 0.9) !important;
            text-align: center !important;
            max-width: 250px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: block !important;
        }
    `;
    targetWindow.document.head.appendChild(pipStyle);
    updatePipTask(); // Initial update
}

export function updatePipTask() {
    if (!pipWindow) return;
    const taskEl = pipWindow.document.getElementById('pip-current-task');
    if (taskEl) {
        const activeTask = document.querySelector('.task-item.active .task-text');
        taskEl.textContent = activeTask ? activeTask.textContent : 'No active task';
    }
}
