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
        if (!timerSection) return console.error('Timer section not found');

        pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 380,
            height: 560,
        });

        copyStyles(pipWindow);
        timerParent = timerSection.parentNode;
        const nextSibling = timerSection.nextSibling;

        pipWindow.document.body.append(timerSection);
        pipWindow.document.body.classList.add('pip-body');

        const updateUI = () => {
            if (!pipWindow) return;
            const currentMode = document.body.className.split(' ').find(c => c.startsWith('mode-')) || 'mode-pomodoro';
            pipWindow.document.body.className = `pip-body ${currentMode}`;
            updatePipTask();
        };

        const observer = new MutationObserver(updateUI);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        const taskObserver = new MutationObserver(updatePipTask);
        const taskList = document.getElementById('task-list');
        if (taskList) taskObserver.observe(taskList, { subtree: true, attributes: true, attributeFilter: ['class'] });

        pipWindow.document.addEventListener('keydown', (e) => {
            const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
            if (isTyping) return;

            if (e.code === 'Space') {
                e.preventDefault();
                import('./timer.js').then(m => m.toggleTimer());
            } else if (e.key.toLowerCase() === 's') {
                import('./timer.js').then(m => m.skipPhase());
            } else if (e.key.toLowerCase() === 'p') {
                togglePiP();
            }
        });

        pipWindow.addEventListener('pagehide', () => {
            pipWindow = null;
            observer.disconnect();
            taskObserver.disconnect();
            if (timerParent && timerSection) {
                if (nextSibling) timerParent.insertBefore(timerSection, nextSibling);
                else timerParent.appendChild(timerSection);
            }
        });

        updateUI();

    } catch (err) {
        console.error('PiP failed:', err);
    }
}

function copyStyles(targetWindow) {
    [...document.styleSheets].forEach((styleSheet) => {
        try {
            const style = document.createElement('style');
            style.textContent = [...styleSheet.cssRules].map(rule => rule.cssText).join('');
            targetWindow.document.head.appendChild(style);
        } catch (e) {
            if (styleSheet.href) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = styleSheet.href;
                targetWindow.document.head.appendChild(link);
            }
        }
    });

    const pipStyle = document.createElement('style');
    pipStyle.textContent = `
        body.pip-body {
            background-color: var(--clr-bg-pomodoro) !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            font-family: 'Inter', sans-serif !important;
            color: white !important;
        }
        body.pip-body.mode-shortBreak { background-color: var(--clr-bg-short) !important; }
        body.pip-body.mode-longBreak { background-color: var(--clr-bg-long) !important; }
        .timer-section {
            width: 100% !important; height: 100% !important;
            display: flex !important; flex-direction: column !important;
            justify-content: space-around !important; align-items: center !important;
            margin: 0 !important; padding: 10px !important;
            background: transparent !important; box-shadow: none !important; border: none !important;
            box-sizing: border-box !important;
        }
        .mode-selector, .status-text { display: none !important; }
        .timer-display {
            position: relative !important; width: 250px !important; height: 250px !important;
            min-height: 250px !important; flex-shrink: 0 !important;
            display: flex !important; justify-content: center !important; align-items: center !important;
            margin: 0 !important;
        }
        .progress-ring {
            position: absolute !important; top: 0 !important; left: 0 !important;
            transform: rotate(-90deg) !important; width: 250px !important; height: 250px !important;
        }
        .time { 
            font-size: 4.5rem !important; font-weight: bold !important; line-height: 1 !important;
            z-index: 10 !important; position: relative !important; text-align: center !important;
            margin: 0 !important; color: white !important;
        }
        .controls { 
            display: flex !important; gap: 20px !important; 
            justify-content: center !important; align-items: center !important;
            width: 100% !important; flex-shrink: 0 !important;
            margin: 0 !important;
        }
        .control-btn { border-radius: 50px !important; border: none !important; cursor: pointer !important; }
        .control-btn.primary { 
            background: white !important; color: #333 !important; min-width: 140px !important; 
            padding: 12px 24px !important; font-weight: bold !important; font-size: 1.1rem !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
        }
        .control-btn.secondary { 
            background: rgba(255, 255, 255, 0.2) !important; color: white !important;
            width: 50px !important; height: 50px !important;
            display: flex !important; justify-content: center !important; align-items: center !important;
            font-size: 1.3rem !important; box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
        }
        #pip-current-task {
            font-size: 1.1rem !important; font-weight: 500 !important;
            text-align: center !important; max-width: 90% !important;
            white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
            flex-shrink: 0 !important; color: rgba(255, 255, 255, 0.9) !important;
            margin: 0 !important;
        }
    `;
    targetWindow.document.head.appendChild(pipStyle);
}

export function updatePipTask() {
    if (!pipWindow) return;
    const taskEl = pipWindow.document.getElementById('pip-current-task');
    if (taskEl) {
        const activeTask = document.querySelector('.task-item.active .task-text');
        taskEl.textContent = activeTask ? activeTask.textContent : '';
        taskEl.style.display = activeTask ? 'block' : 'none';
        if (activeTask) taskEl.style.minHeight = '1.2em';
    }
}
