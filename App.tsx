import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { UserRole } from './types'

import SignIn from './pages/auth/SignIn'
import AuthCallback from './pages/auth/AuthCallback'
import ClassOverview from './pages/teacher/ClassOverview'
import LogAchievement from './pages/teacher/LogAchievement'
import PupilDetail from './pages/teacher/PupilDetail'
import PendingReviews from './pages/teacher/PendingReviews'
import AddPupil from './pages/teacher/AddPupil'
import TeacherSetup from './pages/teacher/TeacherSetup'
import ChildFeed from './pages/parent/ChildFeed'
import AddOutside from './pages/parent/AddOutside'
import StudentDemo from './pages/student/StudentDemo'
import AddAchievement from './pages/student/AddAchievement'
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

function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="page-content">{children}</div>
      <BottomNav role="student" />
    </div>
  )
}

function FullShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell"><div className="page-content no-bottom-nav">{children}</div></div>
}

export default function App() {
  const [role, setRole] = useState<UserRole | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('cairn_last_role')
    return stored === 'teacher' || stored === 'parent' || stored === 'student' ? stored : null
  })
  const hasMagicLinkHash =
    typeof window !== 'undefined' && window.location.hash.includes('access_token')

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={
          role
            ? <Navigate to={role === 'teacher' ? '/teacher' : role === 'parent' ? '/parent' : '/student'} replace />
            : hasMagicLinkHash
              ? <FullShell><AuthCallback onRoleResolved={setRole} /></FullShell>
              : <FullShell><SignIn onRoleSelect={setRole} /></FullShell>
        } />
        <Route path="/home" element={<FullShell><SignIn onRoleSelect={setRole} /></FullShell>} />
        <Route path="/auth/callback" element={<FullShell><AuthCallback onRoleResolved={setRole} /></FullShell>} />

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
        <Route path="/teacher/pupils/new" element={
          <TeacherShell><AddPupil /></TeacherShell>
        } />
        <Route path="/teacher/setup" element={
          <FullShell><TeacherSetup /></FullShell>
        } />

        {/* Parent routes */}
        <Route path="/parent" element={
          <ParentShell><ChildFeed /></ParentShell>
        } />
        <Route path="/parent/add-outside" element={
          <ParentShell><AddOutside /></ParentShell>
        } />

        {/* Student routes */}
        <Route path="/student" element={
          <StudentShell><StudentDemo /></StudentShell>
        } />
        <Route path="/student/add-achievement" element={
          <StudentShell><AddAchievement /></StudentShell>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
