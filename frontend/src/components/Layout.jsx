import { NavLink } from 'react-router-dom'
import FAB from './FAB.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

const NAV_ITEMS = [
  { to: '/',         label: 'Home',     icon: HomeIcon },
  { to: '/log',      label: 'Registro', icon: LogIcon },
  null, // FAB placeholder
  { to: '/progress', label: 'Progresso',icon: ChartIcon },
  { to: '/settings', label: 'Config',   icon: SettingsIcon },
]

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col min-h-screen bg-theme">
      {/* Top utility bar */}
      <div className="border-b pt-safe" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
        <div className="max-w-md mx-auto px-4 h-8 flex items-center justify-between">
          <span className="text-primary font-bold text-[11px] uppercase tracking-widest">Body Tech</span>
          <div className="flex items-center gap-3">
            <span className="text-theme-faint text-[10px] uppercase tracking-wide">18:6</span>
            <button
              onClick={toggleTheme}
              className="text-theme-faint hover:text-theme transition-colors text-[14px]"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom navigation with FAB center */}
      <nav
        className="border-t pb-safe shadow-sticky sticky bottom-0 z-40"
        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
      >
        <div className="max-w-md mx-auto flex items-end">
          {NAV_ITEMS.map((item, i) => {
            if (!item) {
              return (
                <div key="fab" className="flex-1 flex justify-center items-center pb-1 -mt-5">
                  <FAB />
                </div>
              )
            }
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                    isActive ? 'text-primary' : 'text-stone'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M3 9.5L12 3l9 6.5V21H15v-5H9v5H3V9.5z" />
    </svg>
  )
}

function LogIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="square" strokeLinejoin="miter" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
