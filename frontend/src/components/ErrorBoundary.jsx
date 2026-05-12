import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  reset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback(this.state.error, () => this.reset())
    }

    return <ErrorFallback error={this.state.error} onReset={() => this.reset()} />
  }
}

export function ErrorFallback({ error, onReset, title }) {
  const isDev = import.meta.env.DEV
  const message = error?.message || 'Algo deu errado.'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
    >
      <div className="mb-6 text-5xl select-none">⚠️</div>

      <h1 className="text-[20px] font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
        {title || 'Algo deu errado'}
      </h1>

      <p className="text-[14px] mb-6 max-w-xs" style={{ color: 'var(--theme-text-muted)' }}>
        Ocorreu um erro inesperado. Tente novamente ou recarregue o app.
      </p>

      {isDev && message && (
        <pre
          className="text-left text-[11px] px-3 py-2 rounded-lg mb-6 max-w-xs overflow-x-auto w-full"
          style={{ backgroundColor: 'var(--theme-surface-soft)', color: '#e06c75', borderRadius: 10 }}
        >
          {message}
        </pre>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {onReset && (
          <button onClick={onReset} className="btn-primary w-full">
            Tentar novamente
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="btn-outline-dark w-full"
        >
          Recarregar app
        </button>
      </div>
    </div>
  )
}

export function InlineError({ message, onRetry }) {
  if (!message) return null
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ backgroundColor: 'rgba(201,64,64,0.1)', border: '1px solid rgba(201,64,64,0.3)' }}
    >
      <span className="text-lg mt-0.5 shrink-0">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: '#e06c75' }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[12px] font-bold mt-1"
            style={{ color: '#76b900' }}
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}
