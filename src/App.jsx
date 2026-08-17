import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import Students from './pages/Students.jsx'
import Teachers from './pages/Teachers.jsx'
import Parents from './pages/Parents.jsx'
import Departments from './pages/Departments.jsx'
import Classes from './pages/Classes.jsx'
import Courses from './pages/Courses.jsx'
import Enrollments from './pages/Enrollments.jsx'
import Grades from './pages/Grades.jsx'
import Attendances from './pages/Attendances.jsx'
import Exams from './pages/Exams.jsx'
import Fees from './pages/Fees.jsx'
import Payments from './pages/Payments.jsx'
import Announcements from './pages/Announcements.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import ApiExplorer from './pages/ApiExplorer.jsx'
import './styles/global.css'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><MainLayout><Users /></MainLayout></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><MainLayout><Students /></MainLayout></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><MainLayout><Teachers /></MainLayout></ProtectedRoute>} />
          <Route path="/parents" element={<ProtectedRoute><MainLayout><Parents /></MainLayout></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><MainLayout><Departments /></MainLayout></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><MainLayout><Classes /></MainLayout></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><MainLayout><Courses /></MainLayout></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute><MainLayout><Enrollments /></MainLayout></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><MainLayout><Grades /></MainLayout></ProtectedRoute>} />
          <Route path="/attendances" element={<ProtectedRoute><MainLayout><Attendances /></MainLayout></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><MainLayout><Exams /></MainLayout></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute><MainLayout><Fees /></MainLayout></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><MainLayout><Payments /></MainLayout></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><MainLayout><Announcements /></MainLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
          <Route path="/api-explorer" element={<ProtectedRoute><MainLayout><ApiExplorer /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
