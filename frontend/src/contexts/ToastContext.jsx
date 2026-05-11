import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({ showToast: () => {} })

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null

  const typeStyles = {
    success: 'border-primary text-primary',
    error: 'border-error text-error',
    warning: 'border-warning text-warning',
    info: 'border-hairline-strong text-on-dark',
  }

  const typeEmoji = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-md w-full bg-surface-elevated border rounded-sm px-4 py-3 flex items-center gap-3 shadow-sticky pointer-events-auto animate-slide-down ${typeStyles[toast.type] || typeStyles.info}`}
        >
          <span className="text-[16px]">{typeEmoji[toast.type]}</span>
          <span className="text-[14px] font-bold text-on-dark">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
