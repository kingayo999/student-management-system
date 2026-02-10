import { useState, useCallback } from 'react';

/**
 * Custom hook for managing feedback/notification messages
 * @param {number} duration - How long to display the feedback (milliseconds)
 * @returns {Object} Feedback state and control functions
 */
export const useFeedback = (duration = 5000) => {
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    /**
     * Show a feedback message
     * @param {string} type - Message type ('error', 'success', 'warning', 'info')
     * @param {string} message - The message to display
     */
    const showFeedback = useCallback((type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), duration);
    }, [duration]);

    /**
     * Clear the current feedback message
     */
    const clearFeedback = useCallback(() => {
        setFeedback({ type: '', message: '' });
    }, []);

    return { feedback, showFeedback, clearFeedback };
};
