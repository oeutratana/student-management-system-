import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { homePathFor } from './rolePaths.js'
import MainLayout from './layouts/MainLayout.jsx'
import AuthPending from './components/AuthPending.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import GoogleCallback from './pages/GoogleCallback.jsx'
import Register from './pages/Register.jsx'
import SetPassword from './pages/SetPassword.jsx'
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
import StudentDashboard from './pages/StudentDashboard.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import StudentClass from './pages/StudentClass.jsx'
import StudentCourses from './pages/StudentCourses.jsx'
import StudentGrades from './pages/StudentGrades.jsx'
import StudentAttendance from './pages/StudentAttendance.jsx'
import StudentFees from './pages/StudentFees.jsx'
import StudentPayments from './pages/StudentPayments.jsx'
import StudentAnnouncements from './pages/StudentAnnouncements.jsx'
import PaymentReturn from './pages/PaymentReturn.jsx'
import './styles/global.css'

/**
 * Entry point for `/` and for any unknown path.
 *
 * A signed-in user belongs on their own home page for their role, so neither
 * case may land on the public registration form. The decision waits for the
 * stored session to be checked against /api/me: choosing a destination from the
 * user still sitting in localStorage is what sent people to the home page of a
 * previous account after a refresh.
 */
const HomeRedirect = () => {
  const { authInitializing, isAuthenticated, user } = useAuth()

  if (authInitializing) {
    return <AuthPending />
  }

  return <Navigate replace to={isAuthenticated ? homePathFor(user) : "/login"} />
}

/**
 * The roles a route is open to.
 *
 * The API enforces the same split, but the guard has to know as well: a
 * student who types an admin URL into the address bar has to be sent back to
 * their own portal instead of being shown a page that would only fail.
 */
const ADMIN = ["admin"]
const STAFF = ["admin", "teacher"]
const EVERYONE = ["admin", "teacher", "student"]
const STUDENTS = ["student"]

/**
 * One authenticated route. `allowedRoles` is what keeps the pages apart: the
 * same wrapper is used for all of them, but the role list decides who may open
 * it.
 */
const Protected = ({ allowedRoles, children }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
)

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/account/setup-password" element={<SetPassword />} />
          <Route path="/set-password/:token" element={<SetPassword />} />

          {/* Admin panel */}
          <Route path="/dashboard" element={<Protected allowedRoles={STAFF}><Dashboard /></Protected>} />
          <Route path="/users" element={<Protected allowedRoles={ADMIN}><Users /></Protected>} />
          <Route path="/students" element={<Protected allowedRoles={STAFF}><Students /></Protected>} />
          <Route path="/teachers" element={<Protected allowedRoles={ADMIN}><Teachers /></Protected>} />
          <Route path="/parents" element={<Protected allowedRoles={ADMIN}><Parents /></Protected>} />
          <Route path="/departments" element={<Protected allowedRoles={ADMIN}><Departments /></Protected>} />
          <Route path="/classes" element={<Protected allowedRoles={STAFF}><Classes /></Protected>} />
          <Route path="/courses" element={<Protected allowedRoles={STAFF}><Courses /></Protected>} />
          <Route path="/enrollments" element={<Protected allowedRoles={ADMIN}><Enrollments /></Protected>} />
          <Route path="/grades" element={<Protected allowedRoles={STAFF}><Grades /></Protected>} />
          <Route path="/attendances" element={<Protected allowedRoles={STAFF}><Attendances /></Protected>} />
          <Route path="/exams" element={<Protected allowedRoles={STAFF}><Exams /></Protected>} />
          <Route path="/fees" element={<Protected allowedRoles={ADMIN}><Fees /></Protected>} />
          <Route path="/payments" element={<Protected allowedRoles={ADMIN}><Payments /></Protected>} />
          <Route path="/announcements" element={<Protected allowedRoles={STAFF}><Announcements /></Protected>} />
          <Route path="/reports" element={<Protected allowedRoles={STAFF}><Reports /></Protected>} />
          <Route path="/api-explorer" element={<Protected allowedRoles={ADMIN}><ApiExplorer /></Protected>} />
          <Route path="/settings" element={<Protected allowedRoles={EVERYONE}><Settings /></Protected>} />

          {/* Student portal - every route is scoped to the signed-in student */}
          <Route path="/student" element={<Protected allowedRoles={STUDENTS}><StudentDashboard /></Protected>} />
          <Route path="/student/profile" element={<Protected allowedRoles={STUDENTS}><StudentProfile /></Protected>} />
          <Route path="/student/class" element={<Protected allowedRoles={STUDENTS}><StudentClass /></Protected>} />
          <Route path="/student/courses" element={<Protected allowedRoles={STUDENTS}><StudentCourses /></Protected>} />
          <Route path="/student/grades" element={<Protected allowedRoles={STUDENTS}><StudentGrades /></Protected>} />
          <Route path="/student/attendance" element={<Protected allowedRoles={STUDENTS}><StudentAttendance /></Protected>} />
          <Route path="/student/fees" element={<Protected allowedRoles={STUDENTS}><StudentFees /></Protected>} />
          <Route path="/student/payments" element={<Protected allowedRoles={STUDENTS}><StudentPayments /></Protected>} />
          <Route path="/student/announcements" element={<Protected allowedRoles={STUDENTS}><StudentAnnouncements /></Protected>} />

          {/* Where the payment gateway sends the customer back to */}
          <Route path="/payment/payway/return" element={<Protected allowedRoles={STUDENTS}><PaymentReturn /></Protected>} />

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
