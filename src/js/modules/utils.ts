/**
 * Utility functions for FocusTimer
 */

/**
 * Escapes HTML characters in a string to prevent XSS injection
 * @param {string} str - Input string to escape
 * @returns {string} Sanitized string
 */
export function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

export interface ConfirmOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

/**
 * Custom confirm modal
 * @param {string} message - Message to display
 * @param {ConfirmOptions} [options] - Optional custom title, button labels, and style
 * @returns {Promise<boolean>}
 */
export function customConfirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const msgEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn') as HTMLButtonElement | null;
        const cancelBtn = document.getElementById('confirm-cancel-btn') as HTMLButtonElement | null;
        const iconWrap = document.getElementById('confirm-icon-wrap');

        if (!modal || !msgEl || !okBtn || !cancelBtn) {
            // Fallback if modal not in DOM
            resolve(window.confirm(message));
            return;
        }

        const isDanger = options?.isDanger ?? /xóa|delete|hủy|không thể hoàn tác/i.test(message);
        const title = options?.title ?? (isDanger ? 'Xác nhận thao tác xóa' : 'Xác nhận thao tác');
        const confirmText = options?.confirmText ?? (isDanger ? 'Xác nhận xóa' : 'Xác nhận');
        const cancelText = options?.cancelText ?? 'Hủy bỏ';

        if (titleEl) titleEl.textContent = title;
        msgEl.textContent = message;
        okBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        if (iconWrap) {
            if (isDanger) {
                iconWrap.className = 'confirm-icon-wrap danger';
                iconWrap.innerHTML = `
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                `;
                okBtn.className = 'confirm-btn-confirm danger';
            } else {
                iconWrap.className = 'confirm-icon-wrap info';
                iconWrap.innerHTML = `
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                `;
                okBtn.className = 'confirm-btn-confirm primary';
            }
        }

        modal.classList.remove('hidden');

        const cleanup = () => {
            modal.classList.add('hidden');
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            document.removeEventListener('keydown', onKeyDown);
        };

        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                cleanup();
                resolve(false);
            }
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        document.addEventListener('keydown', onKeyDown);
    });
}
