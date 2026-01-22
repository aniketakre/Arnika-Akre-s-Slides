
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  // Fixed: Made children optional to resolve missing property error in index.tsx during JSX instantiation
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fixed: Inherit from React.Component directly and ensure Props and State are properly passed to correctly recognize 'props' and 'state' on the class instance.
class ErrorBoundary extends React.Component<Props, State> {
  // Fixed: Explicitly declare the state property to ensure it exists on the class instance and is correctly typed.
  public state: State = { hasError: false, error: null };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  // Fixed: Added explicit return type ReactNode to the render method to satisfy strict type checking.
  public render(): ReactNode {
    // Fixed: Properly access the state through this.state which is now correctly typed.
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 max-w-md mb-8 text-sm leading-relaxed">
            Arnika Akre encountered an unexpected error. Don't worry, your project is likely safe in the local cache.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase shadow-lg shadow-indigo-100"
            >
              <RefreshCcw size={14} /> Reload Workspace
            </button>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="px-6 py-3 text-gray-400 hover:text-red-500 font-bold text-xs uppercase"
            >
              Clear Cache & Reset
            </button>
          </div>
          <details className="mt-12 text-left bg-white p-4 rounded-xl border border-gray-100 max-w-2xl w-full">
            <summary className="text-[10px] font-bold text-gray-300 uppercase cursor-pointer">Technical Details</summary>
            {/* Fixed: Safely access error stack from the state object. */}
            <pre className="mt-2 text-[10px] text-red-400 font-mono overflow-auto">{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    // Fixed: Access children via this.props as correctly typed by Component inheritance.
    return this.props.children;
  }
}

export default ErrorBoundary;
