import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Skeleton } from '../components/common/Skeleton'

const Home = lazy(() => import('../pages/Home'))
const MapViewPage = lazy(() => import('../pages/MapView'))
const StationDetail = lazy(() => import('../pages/StationDetail'))
const Booking = lazy(() => import('../pages/Booking'))
const BookSlot = lazy(() => import('../pages/BookSlot'))
const BookingLanding = lazy(() => import('../pages/BookingLanding'))
const BookingSuccess = lazy(() => import('../pages/BookingSuccess'))
const Payment = lazy(() => import('../pages/Payment'))
const Profile = lazy(() => import('../pages/Profile'))
const LearnHub = lazy(() => import('../pages/LearnHub'))
const GuideDetail = lazy(() => import('../pages/GuideDetail'))
const ChargingGuide = lazy(() => import('../pages/Resources/ChargingGuide'))
const HelpCenter = lazy(() => import('../pages/Resources/HelpCenter'))
const Blog = lazy(() => import('../pages/Resources/Blog'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Pricing = lazy(() => import('../pages/Pricing'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))

// Solutions
const SolutionsIndividuals = lazy(() => import('../pages/Solutions/Individuals'))
const SolutionsBusiness = lazy(() => import('../pages/Solutions/Business'))
const SolutionsFleet = lazy(() => import('../pages/Solutions/Fleet'))

// Owner
const OwnerDashboard = lazy(() => import('../pages/OwnerPortal/Dashboard'))
const ManageStations = lazy(() => import('../pages/OwnerPortal/ManageStations'))
const ManageChargers = lazy(() => import('../pages/OwnerPortal/ManageChargers'))
const OwnerAnalytics = lazy(() => import('../pages/OwnerPortal/Analytics'))
const OwnerReviews = lazy(() => import('../pages/OwnerPortal/Reviews'))

// Admin
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'))
const ApproveStations = lazy(() => import('../pages/Admin/ApproveStations'))
const ManageUsers = lazy(() => import('../pages/Admin/ManageUsers'))
const ModerateReviews = lazy(() => import('../pages/Admin/ModerateReviews'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col gap-4 p-8 max-w-7xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapViewPage />} />
          <Route path="/station/:slug" element={<StationDetail />} />
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/learn/:guideId" element={<GuideDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/resources/charging-guide" element={<ChargingGuide />} />
          <Route path="/resources/help" element={<HelpCenter />} />
          <Route path="/resources/blog" element={<Blog />} />
          {/* Booking Flow */}
          <Route path="/booking" element={<BookingLanding />} />
          <Route path="/book/:stationId" element={<BookSlot />} />
          <Route path="/book" element={<BookSlot />} />
          <Route path="/bookings" element={<BookSlot />} />
          <Route path="/booking-success" element={<BookingSuccess />} />

          {/* Solutions */}
          <Route path="/solutions/individuals" element={<SolutionsIndividuals />} />
          <Route path="/solutions/business" element={<SolutionsBusiness />} />
          <Route path="/solutions/fleet" element={<SolutionsFleet />} />

          {/* Protected — any authenticated */}
          <Route path="/station/:id/book/:chargerId" element={<Booking />} />
          <Route path="/payment/:bookingId" element={
            <ProtectedRoute allowedRoles={['driver', 'owner', 'admin']}>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['driver', 'owner', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Owner Portal */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner/stations" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <ManageStations />
            </ProtectedRoute>
          } />
          <Route path="/owner/chargers" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <ManageChargers />
            </ProtectedRoute>
          } />
          <Route path="/owner/analytics" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <OwnerAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/owner/reviews" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <OwnerReviews />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/stations" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApproveStations />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ModerateReviews />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
