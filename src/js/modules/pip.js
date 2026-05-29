import { elements } from './elements.js';
import { state } from './state.js';

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

        console.log('PiP: Requesting window...');
        // Request a 20% smaller 1:1 square window (240x240)
        pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 240,
            height: 240,
        });

        // Enforce non-resizable behavior (Strict Vertical Lock)
        const snapSize = () => {
            if (pipWindow && !pipWindow.closed) {
                const targetH = 240;
                // If browser forces a larger width (e.g. 300px), we adapt to it to prevent flickering, 
                // but we strictly lock the height.
                if (pipWindow.innerHeight !== targetH) {
                    pipWindow.resizeTo(pipWindow.innerWidth, targetH);
                }
            }
        };
        pipWindow.addEventListener('resize', snapSize);
        
        // High-frequency check to ensure the window stays locked vertically
        const snapInterval = setInterval(snapSize, 50);

        console.log('PiP: Copying styles...');
        copyStyles(pipWindow);

        // Defer injection to ensure PiP window document is fully ready
        requestAnimationFrame(() => {
            try {
                console.log('PiP: Injecting content...');
                timerParent = timerSection.parentNode;
                const nextSibling = timerSection.nextSibling;

                // Explicitly adopt the node into the PiP document
                const adoptedSection = pipWindow.document.adoptNode(timerSection);
                pipWindow.document.body.append(adoptedSection);
                pipWindow.document.body.classList.add('pip-body');

                // Move task label inside the circular timer
                const pipTaskEl = adoptedSection.querySelector('#pip-current-task');
                const timerDisplay = adoptedSection.querySelector('.timer-display');
                
                const originalTaskParent = pipTaskEl ? taskLabelInitialParent(pipTaskEl) : null;
                const originalTaskSibling = pipTaskEl ? pipTaskEl.nextSibling : null;
                
                if (pipTaskEl && timerDisplay) {
                    timerDisplay.appendChild(pipTaskEl);
                }

                // Create the hover overlay using PiP document context
                const overlay = pipWindow.document.createElement('div');
                overlay.id = 'pip-overlay';
                overlay.className = 'pip-overlay hidden';
                overlay.innerHTML = `
                    <div class="pip-control-icon">
                        <i class="fa-solid ${state.isRunning ? 'fa-pause' : 'fa-play'}"></i>
                        <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                    </div>
                `;
                pipWindow.document.body.appendChild(overlay);

                const updateUI = () => {
                    if (!pipWindow || pipWindow.closed) return;
                    const currentMode = document.body.className.split(' ').find(c => c.startsWith('mode-')) || 'mode-pomodoro';
                    pipWindow.document.body.className = `pip-body ${currentMode}`;
                    
                    const iconEl = overlay.querySelector('i');
                    const labelEl = overlay.querySelector('.pip-control-label');
                    if (iconEl && labelEl) {
                        iconEl.className = `fa-solid ${state.isRunning ? 'fa-pause' : 'fa-play'}`;
                        labelEl.textContent = state.isRunning ? 'Stop' : 'Resume';
                    }
                    
                    updatePipTask();
                };

                const observer = new MutationObserver(updateUI);
                observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

                const taskObserver = new MutationObserver(updatePipTask);
                const taskList = document.getElementById('task-list');
                if (taskList) taskObserver.observe(taskList, { subtree: true, attributes: true, attributeFilter: ['class'] });

                pipWindow.document.body.addEventListener('mouseenter', () => overlay.classList.remove('hidden'));
                pipWindow.document.body.addEventListener('mouseleave', () => overlay.classList.add('hidden'));
                
                overlay.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const { toggleTimer } = await import('./timer.js');
                    toggleTimer();
                    updateUI();
                });

                pipWindow.document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        import('./timer.js').then(m => m.toggleTimer());
                    } else if (e.key.toLowerCase() === 's') {
                        import('./timer.js').then(m => m.skipPhase());
                    } else if (e.key.toLowerCase() === 'p') {
                        pipWindow.close();
                    }
                });

                pipWindow.addEventListener('pagehide', () => {
                    console.log('PiP: Closing and restoring...');
                    pipWindow = null;
                    clearInterval(snapInterval);
                    observer.disconnect();
                    taskObserver.disconnect();
                    
                    if (pipTaskEl && originalTaskParent) {
                        originalTaskParent.appendChild(pipTaskEl);
                    }

                    if (timerParent && adoptedSection) {
                        if (nextSibling) timerParent.insertBefore(adoptedSection, nextSibling);
                        else timerParent.appendChild(adoptedSection);
                    }
                });

                updateUI();
                console.log('PiP: Success');

            } catch (innerErr) {
                clearInterval(snapInterval);
                console.error('PiP Injection Error:', innerErr);
            }
        });

    } catch (err) {
        console.error('PiP Launch Error:', err);
    }
}

// Helper to remember initial parent before move
function taskLabelInitialParent(el) {
    return el.parentNode;
}

function copyStyles(targetWindow) {
    const targetDoc = targetWindow.document;

    // Font Awesome
    const faLink = targetDoc.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    targetDoc.head.appendChild(faLink);

    // Main Styles
    [...document.styleSheets].forEach((styleSheet) => {
        try {
            if (styleSheet.cssRules) {
                const style = targetDoc.createElement('style');
                const rules = [...styleSheet.cssRules].map(rule => rule.cssText).join('');
                style.textContent = rules;
                targetDoc.head.appendChild(style);
            }
        } catch (e) {
            if (styleSheet.href) {
                const link = targetDoc.createElement('link');
                link.rel = 'stylesheet';
                link.href = styleSheet.href;
                targetDoc.head.appendChild(link);
            }
        }
    });

    // Custom PiP Utility Overrides
    const pipStyle = targetDoc.createElement('style');
    pipStyle.textContent = `
        * { box-sizing: border-box !important; }
        
        body.pip-body {
            background-color: var(--clr-bg-pomodoro) !important;
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
        body.pip-body.mode-shortBreak { background-color: var(--clr-bg-short) !important; }
        body.pip-body.mode-longBreak { background-color: var(--clr-bg-long) !important; }
        
        .timer-section {
            width: 100% !important; 
            height: 100% !important;
            display: grid !important; 
            place-items: center !important;
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
            width: 224px !important; 
            height: 224px !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,0.08) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            margin: 0 !important;
        }
        
        .progress-ring {
            position: absolute !important; 
            top: 50% !important; 
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-90deg) !important; 
            width: 224px !important; 
            height: 224px !important;
            pointer-events: none !important;
        }
        
        .progress-ring__circle, .progress-ring__circle-bg {
            r: 104 !important; cx: 112 !important; cy: 112 !important;
            stroke-width: 5 !important;
        }
        
        .time { 
            font-size: 4rem !important; 
            font-weight: 700 !important; 
            line-height: 1 !important;
            margin: 0 !important;
            padding-bottom: 6px !important;
            z-index: 10 !important;
            letter-spacing: -1.5px !important;
        }
        
        #pip-current-task {
            font-size: 0.8rem !important; 
            font-weight: 500 !important;
            text-align: center !important; 
            max-width: 85% !important;
            white-space: nowrap !important; 
            overflow: hidden !important; 
            text-overflow: ellipsis !important;
            color: rgba(255, 255, 255, 0.75) !important;
            margin: 0 !important;
            z-index: 10 !important;
            display: block !important;
        }

        .pip-overlay {
            position: fixed !important; 
            top: 0 !important; 
            left: 0 !important;
            width: 100% !important; 
            height: 100% !important;
            background: rgba(0,0,0,0.5) !important;
            backdrop-filter: blur(2px) !important;
            display: flex !important; 
            justify-content: center !important; 
            align-items: center !important;
            cursor: pointer !important; 
            z-index: 1000 !important;
            transition: opacity 0.2s ease !important;
        }
        .pip-overlay.hidden { opacity: 0 !important; pointer-events: none !important; }
        
        .pip-control-icon {
            display: flex !important; 
            flex-direction: column !important;
            align-items: center !important; 
            gap: 6px !important;
            pointer-events: none !important;
        }
        .pip-control-icon i { font-size: 2.8rem !important; color: white !important; }
        .pip-control-icon span { 
            font-weight: 600 !important; 
            text-transform: uppercase !important; 
            letter-spacing: 1.5px !important;
            font-size: 0.65rem !important;
        }
    `;
    targetDoc.head.appendChild(pipStyle);
}

export function updatePipTask() {
    if (!pipWindow || pipWindow.closed) return;
    const taskEl = pipWindow.document.getElementById('pip-current-task');
    if (taskEl) {
        const activeTask = document.querySelector('.task-item.active .task-text');
        taskEl.textContent = activeTask ? activeTask.textContent : 'Ready to Focus';
        taskEl.style.display = 'block';
    }
}
