import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * ErrorMessage Component
 * Displays error, success, warning, or info messages
 */
const ErrorMessage = ({
    type = 'error', // 'error' | 'success' | 'warning' | 'info'
    message,
    title,
    onClose,
    autoDismiss = true,
    dismissDelay = 5000,
    className = ''
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss && dismissDelay > 0) {
            const timer = setTimeout(() => {
                setVisible(false);
                onClose?.();
            }, dismissDelay);

            return () => clearTimeout(timer);
        }
    }, [autoDismiss, dismissDelay, onClose]);

    if (!visible || !message) return null;

    const config = {
        error: {
            bgColor: 'bg-red-50/90 border-red-100',
            textColor: 'text-red-800',
            iconBg: 'bg-red-100',
            icon: AlertCircle,
            defaultTitle: 'Error'
        },
        success: {
            bgColor: 'bg-emerald-50/90 border-emerald-100',
            textColor: 'text-emerald-800',
            iconBg: 'bg-emerald-100',
            icon: CheckCircle,
            defaultTitle: 'Success'
        },
        warning: {
            bgColor: 'bg-amber-50/90 border-amber-100',
            textColor: 'text-amber-800',
            iconBg: 'bg-amber-100',
            icon: AlertTriangle,
            defaultTitle: 'Warning'
        },
        info: {
            bgColor: 'bg-blue-50/90 border-blue-100',
            textColor: 'text-blue-800',
            iconBg: 'bg-blue-100',
            icon: Info,
            defaultTitle: 'Information'
        }
    };

    const { bgColor, textColor, iconBg, icon: Icon, defaultTitle } = config[type] || config.error;
    const displayTitle = title || defaultTitle;

    return (
        <div
            className={`p-5 rounded-2xl shadow-2xl border flex items-start gap-4 backdrop-blur-xl ${bgColor} ${className}`}
            role="alert"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${textColor} opacity-70`}>
                    {displayTitle}
                </p>
                <p className={`text-xs font-bold ${textColor}`}>
                    {message}
                </p>
            </div>
            {onClose && (
                <button
                    onClick={() => {
                        setVisible(false);
                        onClose();
                    }}
                    className={`${textColor} opacity-50 hover:opacity-100 transition-opacity flex-shrink-0`}
                    aria-label="Close message"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

ErrorMessage.propTypes = {
    type: PropTypes.oneOf(['error', 'success', 'warning', 'info']),
    message: PropTypes.string,
    title: PropTypes.string,
    onClose: PropTypes.func,
    autoDismiss: PropTypes.bool,
    dismissDelay: PropTypes.number,
    className: PropTypes.string,
};

export default ErrorMessage;
