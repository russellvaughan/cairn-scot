import { useNavigate, useLocation } from 'react-router-dom'
import type { UserRole } from '../types'

interface Props {
  role: UserRole
  onLogout: () => void
}

type NavTab = {
  path: string
  label: string
  icon: ({ color }: { color: string }) => JSX.Element
  badge?: boolean
  action?: 'logout'
}

const teacherTabs = [
  { path: '/teacher',         label: 'Class',   icon: HomeIcon },
  { path: '/teacher/log',     label: 'Log',     icon: PlusIcon },
  { path: '/teacher/pending', label: 'Reviews', icon: InboxIcon, badge: true },
  { path: '/logout',          label: 'Logout',  icon: LogoutIcon, action: 'logout' },
] as NavTab[]

const parentTabs = [
  { path: '/parent',             label: 'Feed', icon: HomeIcon },
  { path: '/parent/add-outside', label: 'Add',  icon: PlusIcon },
  { path: '/logout',             label: 'Logout', icon: LogoutIcon, action: 'logout' },
] as NavTab[]

const studentTabs = [
  { path: '/student',                 label: 'Feed', icon: HomeIcon },
  { path: '/student/add-achievement', label: 'Add',  icon: PlusIcon },
  { path: '/logout',                  label: 'Logout', icon: LogoutIcon, action: 'logout' },
] as NavTab[]

export default function BottomNav({ role, onLogout }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const tabs: NavTab[] = role === 'teacher' ? teacherTabs : role === 'parent' ? parentTabs : studentTabs

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      zIndex: 100,
      padding: '0 10px 8px',
    }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid #C5D6EE',
          boxShadow: '0 10px 24px rgba(16,42,67,0.14)',
          borderRadius: 18,
          paddingTop: 8,
          paddingBottom: `calc(8px + env(safe-area-inset-bottom))`,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {tabs.map(tab => {
          const isLogout = tab.action === 'logout'
          const active = tab.path === `/${role}`
            ? location.pathname === tab.path
            : !isLogout && location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => {
                if (isLogout) {
                  onLogout()
                  navigate('/home', { replace: true })
                  return
                }
                navigate(tab.path)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: active ? 'rgba(31,111,229,0.14)' : 'transparent',
                border: 'none',
                borderRadius: 14,
                cursor: 'pointer',
                padding: '6px 14px',
                position: 'relative',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon color={active ? 'var(--color-sky)' : 'var(--color-ink-muted)'} />
                {tab.badge && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 7, height: 7,
                    background: 'var(--color-gold)',
                    borderRadius: '50%',
                    border: '1.5px solid var(--color-stone)',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: active ? 'var(--color-sky)' : 'var(--color-ink-muted)',
              }}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function InboxIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  )
}

function PlusIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function GridIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function LogoutIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
