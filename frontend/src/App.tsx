import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from './contexts/AuthContext'
import UserLayout from './components/UserLayout'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Latest, { TopicDetail, CreateTopic } from './pages/Latest'
import Boards from './pages/Boards'
import Announcements, { AnnouncementDetail } from './pages/Announcements'
import Search from './pages/Search'
import Settings from './pages/Settings'
import UserManagement from './pages/admin/UserManagement'
import BoardManagement from './pages/admin/BoardManagement'
import TopicManagement from './pages/admin/TopicManagement'
import DatabaseManagement from './pages/admin/DatabaseManagement'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/latest" element={<Latest />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route
          path="/create-topic"
          element={
            <ProtectedRoute>
              <CreateTopic />
            </ProtectedRoute>
          }
        />
        <Route path="/boards" element={<Boards />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcement/:id" element={<AnnouncementDetail />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="boards" element={<BoardManagement />} />
        <Route path="topics" element={<TopicManagement />} />
        <Route path="database" element={<DatabaseManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
