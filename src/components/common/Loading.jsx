import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Loading = ({ variant = 'page', size = 'default', className = '' }) => {
    const sizes = {
        small: 'w-4 h-4',
        default: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    if (variant === 'inline') {
        return <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />;
    }

    if (variant === 'overlay') {
        return (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                <Loader2 className={`animate-spin text-primary-600 ${sizes[size]} ${className}`} />
            </div>
        );
    }

    // Default: full page loading
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className={`animate-spin text-primary-600 ${sizes[size]} ${className}`} />
        </div>
    );
};

Loading.propTypes = {
    variant: PropTypes.oneOf(['page', 'inline', 'overlay']),
    size: PropTypes.oneOf(['small', 'default', 'large']),
    className: PropTypes.string,
};

export default Loading;
