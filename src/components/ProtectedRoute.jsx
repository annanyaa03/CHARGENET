import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        setUser(session?.user || null)
      }
    )
  }, [])

  // Still loading
  if (user === undefined) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 border border-gray-200 border-t-gray-900 rounded-full animate-spin">
      </div>
    </div>
  )

  // Not logged in
  if (user === null) {
    return <Navigate to="/signin" replace />
  }

  // Logged in - show content
  return children
}

export default ProtectedRoute
