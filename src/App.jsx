import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Attendance from './pages/Attendance.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import MarkAttendance from './pages/MarkAttendance.jsx'
import Reports from './pages/Reports.jsx'
import Scores from './pages/Scores.jsx'
import Settings from './pages/Settings.jsx'
import Students from './pages/Students.jsx'
import Teachers from './pages/Teachers.jsx'
import AddStudent from './pages/AddStudent.jsx'
import AddTeacher from './pages/AddTeacher.jsx'
import AddClass from './pages/AddClass.jsx'
import Login from './pages/Login.jsx'
import Class from './pages/Class.jsx'
import './styles/global.css'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
          <Route path="/add-student" element={<MainLayout><AddStudent /></MainLayout>} />
          <Route path="/add-class" element={<MainLayout><AddClass /></MainLayout>} />
          <Route path="/attendance" element={<MainLayout><Attendance /></MainLayout>} />
          <Route path="/mark-attendance" element={<MainLayout><MarkAttendance /></MainLayout>} />
          <Route path="/scores" element={<MainLayout><Scores /></MainLayout>} />
          <Route path="/class" element={<MainLayout><Class /></MainLayout>} />
          <Route path="/teachers" element={<MainLayout><Teachers /></MainLayout>} />
          <Route path="/add-teacher" element={<MainLayout><AddTeacher /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
