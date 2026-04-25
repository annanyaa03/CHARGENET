import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Page imports
import Home from './pages/Home'
import MapView from './pages/MapView'
import StationDetail from './pages/StationDetail'
import BookSlot from './pages/BookSlot'
import BookingLanding from './pages/BookingLanding'
import Pricing from './pages/Pricing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'

// Solution pages
import Individuals from './pages/Solutions/Individuals'
import Business from './pages/Solutions/Business'
import Fleet from './pages/Solutions/Fleet'

// Resource pages
import ChargingGuide from './pages/Resources/ChargingGuide'
import HelpCenter from './pages/Resources/HelpCenter'
import Blog from './pages/Resources/Blog'

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/station/:slug" element={<StationDetail />} />
      <Route path="/booking" element={<BookingLanding />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/register" element={<SignUp />} />

      {/* Solution pages */}
      <Route path="/solutions/individuals" element={<Individuals />} />
      <Route path="/solutions/business" element={<Business />} />
      <Route path="/solutions/fleet" element={<Fleet />} />

      {/* Resource pages */}
      <Route path="/resources/charging-guide" element={<ChargingGuide />} />
      <Route path="/resources/help" element={<HelpCenter />} />
      <Route path="/resources/blog" element={<Blog />} />

      {/* Protected routes */}
      <Route path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/book/:stationId" 
        element={
          <ProtectedRoute>
            <BookSlot />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - 404 */}
      <Route path="*" 
        element={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Page not found
              </p>
              <a href="/"
                className="text-xs bg-gray-900 text-white px-4 py-2 hover:bg-black">
                Go home
              </a>
            </div>
          </div>
        } 
      />
    </Routes>
  )
}

export default AppRouter
