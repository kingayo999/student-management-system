import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * EmptyState Component
 * Displays when there's no data to show
 */
const EmptyState = ({
    icon: Icon = AlertCircle,
    title = 'No Data Available',
    description = 'There is nothing to display at the moment.',
    action,
    actionLabel = 'Take Action'
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="bg-primary-50 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 border border-primary-100 shadow-inner">
                <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-200" />
            </div>
            <h3 className="text-primary-950 font-black text-lg sm:text-xl mb-2 tracking-tight font-heading uppercase">
                {title}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm font-medium text-center max-w-md mb-6">
                {description}
            </p>
            {action && (
                <button onClick={action} className="btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string,
    description: PropTypes.string,
    action: PropTypes.func,
    actionLabel: PropTypes.string,
};

export default EmptyState;

