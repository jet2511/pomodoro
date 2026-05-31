import { elements } from './elements.js';
import { state } from './state.js';
import pipCss from '../../css/modules/pip.css?inline';

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
                
                const playSvg = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                const pauseSvg = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                const skipSvg = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>';

                overlay.innerHTML = `
                    <div class="pip-control-icon play-pause-btn">
                        <div class="icon-container">${state.isRunning ? pauseSvg : playSvg}</div>
                        <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                    </div>
                    <div class="pip-control-icon skip-btn">
                        <div class="icon-container">${skipSvg}</div>
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
                    
                    const iconContainerEl = overlay.querySelector('.play-pause-btn .icon-container');
                    const labelEl = overlay.querySelector('.play-pause-btn .pip-control-label');
                    if (iconContainerEl && labelEl) {
                        iconContainerEl.innerHTML = state.isRunning ? pauseSvg : playSvg;
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
    pipStyle.textContent = pipCss;
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
