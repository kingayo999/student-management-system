import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // Call optional onError callback
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                            {this.props.title || 'Something went wrong'}
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                            {this.props.message || 'An unexpected error occurred. Please refresh the page or contact support if the problem persists.'}
                        </p>
                        {this.props.showDetails && process.env.NODE_ENV === 'development' && (
                            <details className="text-left text-xs text-red-800 bg-red-100 p-3 rounded-lg mb-4">
                                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                                <pre className="whitespace-pre-wrap overflow-auto">
                                    {this.state.error && this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        {this.props.onReset && (
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null, errorInfo: null });
                                    this.props.onReset();
                                }}
                                className="btn-primary"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    title: PropTypes.string,
    message: PropTypes.string,
    showDetails: PropTypes.bool,
    onError: PropTypes.func,
    onReset: PropTypes.func,
};

ErrorBoundary.defaultProps = {
    showDetails: true,
};

export default ErrorBoundary;
