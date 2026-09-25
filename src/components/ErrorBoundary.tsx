import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[350px] p-6 rounded-xl border border-red-500/30 bg-red-950/20 text-slate-200 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-400">
              {this.props.fallbackTitle || 'Component Rendering Error Encountered'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {this.state.error?.message || 'An unexpected rendering error occurred. The application remains protected.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 shadow cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
