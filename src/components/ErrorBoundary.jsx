/**
 * @fileoverview ErrorBoundary — catches unhandled render errors so the
 * whole app doesn't crash. Displays a friendly fallback UI instead.
 */

import { Component } from 'react';

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children
 * @property {React.ReactNode} [fallback]
 */

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError
 * @property {string}  message
 */

export default class ErrorBoundary extends Component {
  /** @param {ErrorBoundaryProps} props */
  constructor(props) {
    super(props);
    /** @type {ErrorBoundaryState} */
    this.state = { hasError: false, message: '' };
  }

  /** @param {Error} error */
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  /** @param {Error} error @param {React.ErrorInfo} info */
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            borderRadius: '12px',
            margin: '2rem auto',
            maxWidth: '600px',
          }}
        >
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</p>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{this.state.message}</p>
          <button
            className="btn btn-secondary"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
