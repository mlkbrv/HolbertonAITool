import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-soft-cream">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">Something went wrong</h1>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-semibold"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
