import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Zap, Menu, X, User, MapPin, BookOpen, LayoutDashboard, Shield, ChevronDown, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Button from '../common/Button'

export function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setProfileOpen(false)
  }

  const getNavLinks = () => {
    const base = [
      { to: '/map', label: 'Find Charger', icon: MapPin },
      { to: '/learn', label: 'Learn', icon: BookOpen },
    ]
    return base
  }

  const getPortalLink = () => {
    if (role === 'owner') return { to: '/owner/dashboard', label: 'Owner Portal', icon: LayoutDashboard }
    if (role === 'admin') return { to: '/admin/dashboard', label: 'Admin', icon: Shield }
    return null
  }

  const portalLink = getPortalLink()

  return (
    <nav className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary hover:no-underline">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Zap size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold tracking-tight">ChargeNet</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {getNavLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {portalLink && (
              <NavLink
                to={portalLink.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {portalLink.label}
              </NavLink>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="profile-menu-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface text-sm font-medium text-primary transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl"
                       style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-primary truncate">{user?.name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link to="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-surface rounded-lg transition-colors hover:no-underline">
                        <User size={14} /> My Profile
                      </Link>
                      {portalLink && (
                        <Link to={portalLink.to} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-surface rounded-lg transition-colors hover:no-underline">
                          <portalLink.icon size={14} /> {portalLink.label}
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-[#FEF2F2] rounded-lg transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted hover:text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {getNavLinks().map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-accent bg-[#F0FDFA]' : 'text-muted hover:text-primary hover:bg-surface'}`}>
              <link.icon size={16} /> {link.label}
            </NavLink>
          ))}
          {portalLink && (
            <NavLink to={portalLink.to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-accent bg-[#F0FDFA]' : 'text-muted hover:text-primary hover:bg-surface'}`}>
              <portalLink.icon size={16} /> {portalLink.label}
            </NavLink>
          )}
          <div className="pt-2 border-t border-border space-y-1">
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-primary hover:bg-surface hover:no-underline">
                  <User size={16} /> My Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-[#FEF2F2]">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setMobileOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-primary hover:bg-surface">
                  Sign In
                </button>
                <button onClick={() => { navigate('/register'); setMobileOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium bg-accent text-white">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
