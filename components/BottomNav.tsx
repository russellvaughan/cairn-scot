import { useNavigate, useLocation } from 'react-router-dom'
import type { UserRole } from '../types'

interface Props {
  role: UserRole
}

const teacherTabs = [
  { path: '/teacher',         label: 'Class',   icon: HomeIcon },
  { path: '/teacher/log',     label: 'Log',     icon: PlusIcon },
  { path: '/teacher/pending', label: 'Reviews', icon: InboxIcon, badge: true },
]

const parentTabs = [
  { path: '/parent',             label: 'Feed', icon: HomeIcon },
  { path: '/parent/add-outside', label: 'Add',  icon: PlusIcon },
]

export default function BottomNav({ role }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = role === 'teacher' ? teacherTabs : parentTabs

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: 'rgba(238,244,255,0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--color-border)',
      boxShadow: '0 -8px 20px rgba(16,42,67,0.08)',
      paddingTop: 10,
      paddingBottom: `calc(10px + env(safe-area-inset-bottom))`,
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path ||
          (tab.path !== '/teacher' && tab.path !== '/parent' && location.pathname.startsWith(tab.path))
        const Icon = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
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
              {(tab as any).badge && (
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
