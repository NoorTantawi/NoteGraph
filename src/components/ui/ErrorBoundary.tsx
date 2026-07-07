import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm my-2">
          <p className="font-semibold mb-1">Error rendering {this.props.name}</p>
          <pre className="text-xs overflow-x-auto p-2 bg-[var(--bg-primary)] rounded">
            {this.state.error?.message || 'Unknown error'}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
