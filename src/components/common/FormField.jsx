import React from 'react';
import PropTypes from 'prop-types';

/**
 * FormField Component
 * Wrapper for form inputs with label, error state, and help text
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    helpText,
    required = false,
    placeholder,
    className = '',
    children,
    ...props
}) => {
    const inputId = `field-${name}`;
    const hasError = !!error;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] ml-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {children || (
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`input-field ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
                    {...props}
                />
            )}

            {hasError && (
                <p
                    id={`${inputId}-error`}
                    className="text-xs font-bold text-red-600 ml-1 flex items-center gap-1"
                    role="alert"
                >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                    {error}
                </p>
            )}

            {!hasError && helpText && (
                <p
                    id={`${inputId}-help`}
                    className="text-[10px] font-medium text-gray-400 ml-1"
                >
                    {helpText}
                </p>
            )}
        </div>
    );
};

FormField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    error: PropTypes.string,
    helpText: PropTypes.string,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default FormField;

