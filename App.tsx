import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { UserRole } from './types'

import SignIn from './pages/auth/SignIn'
import ClassOverview from './pages/teacher/ClassOverview'
import LogAchievement from './pages/teacher/LogAchievement'
import PupilDetail from './pages/teacher/PupilDetail'
import PendingReviews from './pages/teacher/PendingReviews'
import ChildFeed from './pages/parent/ChildFeed'
import AddOutside from './pages/parent/AddOutside'
import BottomNav from './components/BottomNav'

function TeacherShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="page-content">{children}</div>
      <BottomNav role="teacher" />
    </div>
  )
}

function ParentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="page-content">{children}</div>
      <BottomNav role="parent" />
    </div>
  )
}

function FullShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell"><div className="page-content">{children}</div></div>
}

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null)

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={
          role
            ? <Navigate to={role === 'teacher' ? '/teacher' : '/parent'} replace />
            : <FullShell><SignIn onRoleSelect={setRole} /></FullShell>
        } />

        {/* Teacher routes */}
        <Route path="/teacher" element={
          <TeacherShell><ClassOverview /></TeacherShell>
        } />
        <Route path="/teacher/log" element={
          <TeacherShell><LogAchievement /></TeacherShell>
        } />
        <Route path="/teacher/pupil/:id" element={
          <TeacherShell><PupilDetail /></TeacherShell>
        } />
        <Route path="/teacher/pending" element={
          <TeacherShell><PendingReviews /></TeacherShell>
        } />
        <Route path="/teacher/recent" element={
          <TeacherShell>
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>Recent</h1>
              <p style={{ color: 'var(--color-ink-soft)', fontSize: 14 }}>Coming in V2 — will show a chronological feed of all achievements across the class.</p>
            </div>
          </TeacherShell>
        } />
        <Route path="/teacher/coverage" element={
          <TeacherShell>
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>Coverage</h1>
              <p style={{ color: 'var(--color-ink-soft)', fontSize: 14 }}>Coming in V2 — will show a class-level grid of which curriculum areas have been evidenced.</p>
            </div>
          </TeacherShell>
        } />

        {/* Parent routes */}
        <Route path="/parent" element={
          <ParentShell><ChildFeed /></ParentShell>
        } />
        <Route path="/parent/add-outside" element={
          <ParentShell><AddOutside /></ParentShell>
        } />
        <Route path="/parent/profile" element={
          <ParentShell>
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>Profile</h1>
              <p style={{ color: 'var(--color-ink-soft)', fontSize: 14 }}>Coming in V2 — will show the four CfE capacities and a summary of progress across the year.</p>
            </div>
          </ParentShell>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
