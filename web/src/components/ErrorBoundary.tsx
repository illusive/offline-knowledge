// Keeps an error in one part of the app (e.g. the map) from blanking the whole app: the part
// shows its fallback instead, and the tab bar keeps working.

import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
