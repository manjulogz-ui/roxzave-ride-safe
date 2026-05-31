import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

type Props = { children: ReactNode; title?: string };
type State = { error: Error | null };

export class RouteBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RouteBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <h2 className="text-lg font-bold text-foreground">Something went wrong</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {this.props.title ? `${this.props.title} could not load.` : "This page could not load."}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">{this.state.error.message}</p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              Retry
            </button>
            <Link to="/" className="rounded-xl border border-border px-4 py-2 text-sm font-bold">
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
