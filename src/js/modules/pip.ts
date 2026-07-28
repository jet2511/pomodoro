import { state } from './state';
import { toggleTimer, skipPhase } from './timer';

let pipWindow: any = null;
let timerParent: Node | null = null;
let pipCleanups: Array<() => void> = [];

export function isPiPSupported(): boolean {
    return 'documentPictureInPicture' in window;
}

export function initPiP(): void {
    if (isPiPSupported()) {
        const pipBtn = document.getElementById('pip-btn');
        if (pipBtn) pipBtn.style.display = 'block';
    }
}

function runPipCleanups(): void {
    pipCleanups.forEach(cleanup => {
        try {
            cleanup();
        } catch (e) {
            console.error('PiP cleanup error:', e);
        }
    });
    pipCleanups = [];
}

export async function togglePiP(): Promise<void> {
    if (pipWindow) {
        pipWindow.close();
        return;
    }

    try {
        const timerSection = document.querySelector('.timer-section');
        if (!timerSection) return console.error('Timer section not found');

        console.log('PiP: Requesting window...');
        // Request a 20% smaller 1:1 square window (240x240)
        pipWindow = await (window as any).documentPictureInPicture.requestWindow({
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
                const pipTaskEl = adoptedSection.querySelector('#current-task-display') as HTMLElement | null;
                const timerDisplay = adoptedSection.querySelector('.timer-display') as HTMLElement | null;
                const svgElement = adoptedSection.querySelector('.progress-ring') as SVGElement | null;
                
                if (svgElement && !svgElement.getAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', '0 0 250 250');
                }
                
                const originalTaskParent = pipTaskEl ? taskLabelInitialParent(pipTaskEl) : null;
                const originalTaskSibling = pipTaskEl ? pipTaskEl.nextSibling : null;
                
                // Move task label inside the circular timer
                if (pipTaskEl && timerDisplay) {
                    timerDisplay.appendChild(pipTaskEl);
                }
                // Create the hover overlay using PiP document context
                const overlay = pipWindow.document.createElement('div');
                overlay.id = 'pip-overlay';
                overlay.className = 'pip-overlay hidden';
                const playSvg = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                const pauseSvg = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
                const skipSvg = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>`;

                overlay.innerHTML = `
                    <div class="pip-control-icon play-pause-btn">
                        ${state.isRunning ? pauseSvg : playSvg}
                        <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                    </div>
                    <div class="pip-control-icon skip-btn">
                        ${skipSvg}
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
                    
                    const playPauseBtn = overlay.querySelector('.play-pause-btn') as HTMLElement | null;
                    if (playPauseBtn) {
                        const playSvg2 = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                        const pauseSvg2 = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
                        
                        playPauseBtn.innerHTML = `
                            ${state.isRunning ? pauseSvg2 : playSvg2}
                            <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                        `;
                    }
                    
                    updateActiveTaskDisplay();
                };

                const observer = new MutationObserver(updateUI);
                observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
                pipCleanups.push(() => observer.disconnect());

                const taskObserver = new MutationObserver(updateActiveTaskDisplay);
                const taskList = document.getElementById('task-list');
                if (taskList) {
                    taskObserver.observe(taskList, { subtree: true, attributes: true, attributeFilter: ['class'] });
                    pipCleanups.push(() => taskObserver.disconnect());
                }

                const targetDoc = pipWindow.document;
                const targetBody = pipWindow.document.body;

                const mouseEnterHandler = () => overlay.classList.remove('hidden');
                const mouseLeaveHandler = () => overlay.classList.add('hidden');
                targetBody.addEventListener('mouseenter', mouseEnterHandler);
                targetBody.addEventListener('mouseleave', mouseLeaveHandler);
                pipCleanups.push(() => {
                    targetBody.removeEventListener('mouseenter', mouseEnterHandler);
                    targetBody.removeEventListener('mouseleave', mouseLeaveHandler);
                });
                
                const playPauseBtn = overlay.querySelector('.play-pause-btn') as HTMLElement;
                const skipBtn = overlay.querySelector('.skip-btn') as HTMLElement;
                
                const playPauseClick = (e: Event) => {
                    e.stopPropagation();
                    toggleTimer();
                    updateUI();
                };
                playPauseBtn.addEventListener('click', playPauseClick);
                pipCleanups.push(() => {
                    if (playPauseBtn) playPauseBtn.removeEventListener('click', playPauseClick);
                });

                const skipClick = (e: Event) => {
                    e.stopPropagation();
                    skipPhase();
                };
                skipBtn.addEventListener('click', skipClick);
                pipCleanups.push(() => {
                    if (skipBtn) skipBtn.removeEventListener('click', skipClick);
                });

                const showActionFeedback = (action: 'play' | 'pause' | 'skip') => {
                    if (!pipWindow) return;
                    const feedback = targetDoc.createElement('div');
                    feedback.className = 'pip-action-feedback';
                    
                    let svg = '';
                    let text = '';
                    
                    if (action === 'play') {
                        svg = playSvg;
                        text = 'Resume';
                    } else if (action === 'pause') {
                        svg = pauseSvg;
                        text = 'Stop';
                    } else if (action === 'skip') {
                        svg = skipSvg;
                        text = 'Skip';
                    }

                    feedback.innerHTML = `
                        <div class="icon">${svg}</div>
                        <div class="text">${text}</div>
                    `;
                    targetBody.appendChild(feedback);
                    
                    requestAnimationFrame(() => {
                        feedback.classList.add('show');
                        setTimeout(() => {
                            feedback.classList.remove('show');
                            setTimeout(() => feedback.remove(), 300);
                        }, 600);
                    });
                };

                const keydownHandler = (e: KeyboardEvent) => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        toggleTimer();
                        updateUI();
                        showActionFeedback(state.isRunning ? 'play' : 'pause');
                    } else if (e.key.toLowerCase() === 's') {
                        skipPhase();
                        updateUI();
                        showActionFeedback('skip');
                    } else if (e.key.toLowerCase() === 'p') {
                        if (pipWindow) pipWindow.close();
                    }
                };
                targetDoc.addEventListener('keydown', keydownHandler);
                pipCleanups.push(() => {
                    targetDoc.removeEventListener('keydown', keydownHandler);
                });

                pipWindow.addEventListener('pagehide', () => {
                    console.log('PiP: Closing and restoring...');
                    runPipCleanups();
                    pipWindow = null;
                    
                    if (pipTaskEl && originalTaskParent) {
                        if (originalTaskSibling) {
                            originalTaskParent.insertBefore(pipTaskEl, originalTaskSibling);
                        } else {
                            originalTaskParent.appendChild(pipTaskEl);
                        }
                    }

                    if (timerParent && adoptedSection) {
                        document.adoptNode(adoptedSection);
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
function taskLabelInitialParent(el: HTMLElement): ParentNode {
    return el.parentNode as ParentNode;
}

function copyStyles(targetWindow: Window): void {
    const targetDoc = targetWindow.document;

    // Font Awesome
    const faLink = targetDoc.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    targetDoc.head.appendChild(faLink);

    // Main Styles
    Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
            if (styleSheet.cssRules) {
                const style = targetDoc.createElement('style');
                const rules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
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
            gap: 2.5vmin !important;
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
            padding: 0 !important;
            z-index: 10 !important;
            letter-spacing: -1.5px !important;
        }
        
        #current-task-display {
            font-size: min(4.5vmin, 0.85rem) !important; 
            max-width: 85% !important;
            margin: 0 !important;
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
            background: rgba(0,0,0,0.6) !important;
            display: flex !important; 
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: min(8vmin, 20px) !important;
            padding: 0 !important;
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

        /* Action Feedback Animation */
        .pip-action-feedback {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(0.8) !important;
            background: rgba(0, 0, 0, 0.65) !important;
            color: white !important;
            padding: min(4vmin, 15px) min(6vmin, 25px) !important;
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: min(2vmin, 8px) !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            z-index: 2000 !important;
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
        }
        .pip-action-feedback.show {
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
        }
        .pip-action-feedback .icon svg {
            width: min(10vmin, 40px) !important;
            height: min(10vmin, 40px) !important;
        }
        .pip-action-feedback .text {
            font-size: min(3.5vmin, 14px) !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }

        /* Responsive Layout for Short Windows or narrow windows */
        @media (max-height: 160px), (max-width: 200px) {
            .progress-ring {
                display: none !important;
            }
            .timer-display {
                width: 100vw !important;
                height: 100vh !important;
            }
            .time {
                font-size: min(40vh, 20vw, 4rem) !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #current-task-display {
                font-size: min(15vh, 8vw, 1.2rem) !important;
                margin: 0 !important;
            }
        }
    `;
    targetDoc.head.appendChild(pipStyle);
}

export function updateActiveTaskDisplay(): void {
    let taskEl: HTMLElement | null = null;
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
