/**
 * Utility functions for FocusTimer
 */

/**
 * Checks if the user is currently typing in an input, textarea or contenteditable element
 * @param {KeyboardEvent} e - Keyboard event
 * @returns {boolean}
 */
export function isUserTyping(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement;
    return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
    );
}

/**
 * Simple debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: any;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Traps focus inside a modal element
 * @param {KeyboardEvent} e - Keyboard event
 * @param {HTMLElement} modalElement - The modal wrapper
 */
export function trapFocus(e: KeyboardEvent, modalElement: HTMLElement): void {
    if (e.key !== 'Tab') return;
    
    const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

/**
 * Custom confirm modal
 * @param {string} message - Message to display
 * @returns {Promise<boolean>}
 */
export function customConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');

        if (!modal || !msgEl || !okBtn || !cancelBtn) {
            // Fallback if modal not in DOM
            resolve(window.confirm(message));
            return;
        }

        msgEl.textContent = message;
        modal.classList.remove('hidden');

        const cleanup = () => {
            modal.classList.add('hidden');
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
}
