/**
 * Utility functions for FocusTimer
 */

/**
 * Checks if the user is currently typing in an input, textarea or contenteditable element
 * @param {Event} e - Keyboard event
 * @returns {boolean}
 */
export function isUserTyping(e) {
    const target = e.target;
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
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
