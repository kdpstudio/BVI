'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="bg-surface border border-red/30 p-6 text-center">
          <div className="font-orbitron text-xs text-red/70 tracking-[2px] mb-2">{'// SYSTEM ERROR'}</div>
          <p className="text-textMuted font-rajdhani text-sm">Something went wrong loading this section.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 font-orbitron text-xs text-cyan hover:opacity-80 transition-opacity tracking-wider"
          >
            RETRY →
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
