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
                const pipTaskEl = adoptedSection.querySelector('#current-task-display');
                const timerDisplay = adoptedSection.querySelector('.timer-display');
                const svgElement = adoptedSection.querySelector('.progress-ring');
                
                if (svgElement && !svgElement.getAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', '0 0 250 250');
                }
                
                const originalTaskParent = pipTaskEl ? taskLabelInitialParent(pipTaskEl) : null;
                const originalTaskSibling = pipTaskEl ? pipTaskEl.nextSibling : null;
                
                // We no longer move the task display inside the timer.
                // It remains below the controls (which are hidden), so it sits under the timer.

                // Create the hover overlay using PiP document context
                const overlay = pipWindow.document.createElement('div');
                overlay.id = 'pip-overlay';
                overlay.className = 'pip-overlay hidden';
                overlay.innerHTML = `
                    <div class="pip-control-icon play-pause-btn">
                        <i class="fa-solid ${state.isRunning ? 'fa-pause' : 'fa-play'}"></i>
                        <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                    </div>
                    <div class="pip-control-icon skip-btn">
                        <i class="fa-solid fa-forward-step"></i>
                        <span class="pip-control-label">Skip</span>
                    </div>
                `;
                pipWindow.document.body.appendChild(overlay);

                const updateUI = () => {
                    if (!pipWindow || pipWindow.closed) return;
                    const currentMode = document.body.className.split(' ').find(c => c.startsWith('mode-')) || 'mode-pomodoro';
                    pipWindow.document.body.className = `pip-body ${currentMode}`;
                    
                    if (timerDisplay) {
                        if (state.isRunning) {
                            timerDisplay.classList.add('is-running');
                        } else {
                            timerDisplay.classList.remove('is-running');
                        }
                    }
                    
                    const iconEl = overlay.querySelector('.play-pause-btn i');
                    const labelEl = overlay.querySelector('.play-pause-btn .pip-control-label');
                    if (iconEl && labelEl) {
                        iconEl.className = `fa-solid ${state.isRunning ? 'fa-pause' : 'fa-play'}`;
                        labelEl.textContent = state.isRunning ? 'Stop' : 'Resume';
                    }
                    
                    updateActiveTaskDisplay();
                };

                const observer = new MutationObserver(updateUI);
                observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

                const taskObserver = new MutationObserver(updateActiveTaskDisplay);
                const taskList = document.getElementById('task-list');
                if (taskList) taskObserver.observe(taskList, { subtree: true, attributes: true, attributeFilter: ['class'] });

                pipWindow.document.body.addEventListener('mouseenter', () => overlay.classList.remove('hidden'));
                pipWindow.document.body.addEventListener('mouseleave', () => overlay.classList.add('hidden'));
                
                const playPauseBtn = overlay.querySelector('.play-pause-btn');
                const skipBtn = overlay.querySelector('.skip-btn');
                
                playPauseBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const { toggleTimer } = await import('./timer.js');
                    toggleTimer();
                    updateUI();
                });

                skipBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const { skipPhase } = await import('./timer.js');
                    skipPhase();
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
        
        .timer-display.is-running .progress-ring__circle {
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)) !important;
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
        
        .progress-ring__circle, .progress-ring__circle-bg {
            stroke-width: 12 !important;
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
            display: none !important;
        }
        #current-task-display.has-task {
            display: block !important;
        }

        .pip-overlay {
            position: fixed !important; 
            top: 0 !important; 
            left: 0 !important;
            width: 100% !important; 
            height: 100% !important;
            background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 30%, transparent 100%) !important;
            display: flex !important; 
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important; 
            align-items: flex-end !important;
            gap: min(8vmin, 20px) !important;
            padding-bottom: min(10vmin, 24px) !important;
            z-index: 1000 !important;
            transition: opacity 0.2s ease !important;
            min-width: 0 !important;
        }
        .pip-overlay.hidden { opacity: 0 !important; pointer-events: none !important; }
        
        .pip-control-icon {
            display: flex !important; 
            flex-direction: column !important;
            align-items: center !important; 
            gap: min(3vmin, 8px) !important;
            cursor: pointer !important;
            pointer-events: auto !important;
            transition: transform 0.2s ease !important;
        }
        .pip-control-icon:hover {
            transform: scale(1.1) !important;
        }
        .pip-control-icon i { font-size: min(12vmin, 2.8rem) !important; color: white !important; }
        .pip-control-icon span { 
            font-weight: 600 !important; 
            text-transform: uppercase !important; 
            letter-spacing: 1.5px !important;
            font-size: min(3vmin, 0.65rem) !important;
        }

        /* Responsive Layout for Short Windows */
        @media (max-height: 160px) {
            .progress-ring {
                display: none !important;
            }
            .timer-display {
                width: 100vw !important;
                height: 100vh !important;
            }
            .time {
                font-size: min(40vh, 4rem) !important;
                margin-top: 0 !important;
            }
            #current-task-display {
                font-size: min(15vh, 1.2rem) !important;
                margin-top: 5px !important;
            }
        }
    `;
    targetDoc.head.appendChild(pipStyle);
}

export function updateActiveTaskDisplay() {
    let taskEl = null;
    if (pipWindow && !pipWindow.closed) {
        taskEl = pipWindow.document.getElementById('current-task-display');
    }
    if (!taskEl) {
        taskEl = document.getElementById('current-task-display');
    }
    
    if (taskEl) {
        const activeTask = document.querySelector('.task-item.active .task-text');
        if (activeTask) {
            taskEl.textContent = activeTask.textContent;
            taskEl.classList.add('has-task');
        } else {
            taskEl.textContent = '';
            taskEl.classList.remove('has-task');
        }
    }
}
