import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { ModalProvider } from './contexts/ModalContext.jsx'
import { UserProvider } from './contexts/UserContext.jsx'
import Layout from './components/Layout.jsx'
import GlobalModals from './components/GlobalModals.jsx'
import StickyBar from './components/StickyBar.jsx'
import Home from './pages/Home.jsx'
import Log from './pages/Log.jsx'
import Progress from './pages/Progress.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

function ProtectedApp({ user }) {
  return (
    <UserProvider user={user}>
      <ModalProvider>
        <Layout>
          <StickyBar />
          <Routes>
            <Route path="/"         element={<Home     user={user} />} />
            <Route path="/log"      element={<Log      user={user} />} />
            <Route path="/progress" element={<Progress user={user} />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <GlobalModals />
      </ModalProvider>
    </UserProvider>
  )
}

function AuthedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-theme-faint text-[11px] uppercase tracking-widest font-bold">Body Tech</span>
        </div>
      </div>
    )
  }

  return user ? <ProtectedApp user={user} /> : <Login />
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthedApp />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
