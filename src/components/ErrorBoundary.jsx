import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console for debugging
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Optionally reload the page
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="mb-6">
                            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-600 mb-6">
                                We encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-48">
                                <p className="text-xs font-mono text-red-600 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="text-xs text-gray-600">
                                        <summary className="cursor-pointer font-semibold mb-2">Stack Trace</summary>
                                        <pre className="whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="w-full border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                            >
                                Return to Home
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-gray-500">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
