import { elements } from './elements.js';

let pipWindow = null;
let timerParent = null;

export function isPiPSupported() {
    return 'documentPictureInPicture' in window;
}

export function initPiP() {
    if (isPiPSupported()) {
        elements.pipBtn.style.display = 'block';
    }
}

export async function togglePiP() {
    if (pipWindow) {
        pipWindow.close();
        return;
    }

    try {
        // Open a PiP window
        pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 300,
            height: 400,
        });

        // Copy styles to the PiP window
        copyStyles(pipWindow);

        // Backup the original parent and position of the timer section
        const timerSection = elements.timerSection;
        timerParent = timerSection.parentNode;
        const nextSibling = timerSection.nextSibling;

        // Move the timer section to the PiP window
        pipWindow.document.body.append(timerSection);
        pipWindow.document.body.classList.add('pip-body');

        // Add mode class to pip body for theming
        const updatePipTheme = () => {
            pipWindow.document.body.className = `pip-body ${document.body.className}`;
        };
        updatePipTheme();

        // Listen for changes in the main document's body class (theme/mode shifts)
        const observer = new MutationObserver(updatePipTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Handle PiP window close
        pipWindow.addEventListener('pagehide', (event) => {
            pipWindow = null;
            observer.disconnect();

            // Move the timer section back to its original parent
            if (nextSibling) {
                timerParent.insertBefore(timerSection, nextSibling);
            } else {
                timerParent.appendChild(timerSection);
            }
        });

    } catch (err) {
        console.error('Failed to open PiP window:', err);
    }
}

function copyStyles(targetWindow) {
    const allCSS = [...document.styleSheets]
        .map((styleSheet) => {
            try {
                return [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            } catch (e) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type;
                link.media = styleSheet.media;
                link.href = styleSheet.href;
                targetWindow.document.head.appendChild(link);
            }
            return '';
        })
        .join('');

    if (allCSS) {
        const style = document.createElement('style');
        style.textContent = allCSS;
        targetWindow.document.head.appendChild(style);
    }
}
