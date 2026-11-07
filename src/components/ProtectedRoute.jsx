import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthPending from './AuthPending'
import { homePathFor, roleOf } from '../rolePaths'

/**
 * Gate for authenticated routes.
 *
 * `allowedRoles` is checked against the role of the user /api/me returned, never
 * against anything read from storage, so the page that renders and the role it
 * was authorised for always come from the same source.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authInitializing, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (authInitializing) {
    return <AuthPending />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(roleOf(user))) {
    return <Navigate to={homePathFor(user)} replace />
  }

  return children
}

export default ProtectedRoute
