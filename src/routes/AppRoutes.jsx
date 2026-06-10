import { useState } from 'react'
import MainLayout from '../layouts/MainLayout.jsx'
import Attendance from '../pages/Attendance.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Reports from '../pages/Reports.jsx'
import Scores from '../pages/Scores.jsx'
import Settings from '../pages/Settings.jsx'
import Students from '../pages/Students.jsx'
import Teachers from '../pages/Teachers.jsx'
import AddStudent from '../pages/AddStudent.jsx'
import AddTeacher from '../pages/AddTeacher.jsx'
import Class from '../pages/Class.jsx'

const pages = {
  Dashboard,
  Students,
  Class,
  AddStudent,
  Attendance,
  Scores,
  Teachers,
  AddTeacher,
  Reports,
  Settings,
}
const AppRoutes = () => {
  const [activePage, setActivePage] = useState('Dashboard')
  const ActivePage = pages[activePage]

  return (
    <MainLayout activePage={activePage} onNavigate={setActivePage}>
      <ActivePage onNavigate={setActivePage} />
    </MainLayout>
  )
}

export default AppRoutes
