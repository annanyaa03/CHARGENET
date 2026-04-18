import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import {
  Zap,
  MapPin,
  Plug,
  CalendarCheck,
  Map as MapIcon,
  BookOpen,
  Lightbulb,
  Newspaper,
  Bell,
  ChevronDown,
} from 'lucide-react';

const navData = {
  solutions: [
    { label: 'For Individuals', subtitle: 'Personal charging solutions',    to: '/solutions/individuals' },
    { label: 'For Business',    subtitle: 'Workplace and retail charging',  to: '/solutions/business' },
    { label: 'Fleet Solutions', subtitle: 'Scale your EV fleet',            to: '/solutions/fleet' },
  ],
  resources: [
    { icon: BookOpen,  label: 'Charging Guide', subtitle: 'Everything you need to know',  color: 'text-blue-600',  bg: 'bg-blue-50',  to: '/resources/guide' },
    { icon: Lightbulb, label: 'Help Center',    subtitle: 'Support & documentation',      color: 'text-amber-600', bg: 'bg-amber-50', to: '/resources/help' },
    { icon: Newspaper, label: 'Latest Blog',    subtitle: 'Industry news & updates',      color: 'text-teal-600',  bg: 'bg-teal-50',  to: '/resources/blog' },
  ]
};

// Prefetch function for stations
const prefetchStations = async () => {
  try {
    const cached = localStorage.getItem('chargenet_stations');
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      const isOld = Date.now() - timestamp > 5 * 60 * 1000;
      if (!isOld) return; // Already cached and fresh
    }

    const { data } = await supabase
      .from('stations')
      .select(`
        id, name, address, city, state, lat, lng, status, 
        rating, total_reviews, facilities, open_hours, 
        price_per_kwh, connector_types, total_slots,
        chargers(status)
      `);
    
    if (data) {
      localStorage.setItem(
        'chargenet_stations',
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
      console.log('[Navbar] Stations prefetched successfully');
    }
  } catch (err) {
    console.error('[Navbar] Prefetch error:', err);
  }
};

export function Navbar({ solid = false }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolledState, setIsScrolledState] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const isScrolled = solid || isScrolledState;
  const navRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isPartiallyActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledState(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const menuId = (name) => `nav-menu-${name}`;
  const triggerId = (name) => `nav-trigger-${name}`;

  const DropdownTrigger = ({ name, label }) => {
    const isOpen = activeDropdown === name;
    return (
      <button
        id={triggerId(name)}
        onClick={() => toggleDropdown(name)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId(name)}
        className={`flex items-center gap-1.5 font-medium px-2 py-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9EFF] rounded-none ${
          isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
        }`}
      >
        {label}
        <ChevronDown
          size={14}
          className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    );
  };

  const DropdownMenu = ({ name, items, alignRight = false }) => {
    if (activeDropdown !== name) return null;
    return (
      <div
        id={menuId(name)}
        role="menu"
        aria-labelledby={triggerId(name)}
        className={`absolute top-full mt-3 w-72 bg-white border border-gray-200 shadow-sm py-1 z-50 ${
          alignRight ? 'right-0' : 'left-0'
        }`}
      >
        {items.map((item, index) => {
          if (item.divider) {
            return <div key={index} className="h-px bg-gray-100 my-1 mx-4" role="separator" />;
          }
          const Icon = item.icon;
          if (Icon) {
            // Icon-style items (Resources)
            return (
              <Link
                key={index}
                to={item.to || '#'}
                role="menuitem"
                className="flex items-start gap-3.5 px-5 py-3 hover:bg-gray-50 transition-all text-left group"
                onClick={() => setActiveDropdown(null)}
              >
                <div className="mt-0.5 p-1.5 bg-gray-50 text-gray-400 group-hover:text-gray-700 group-hover:bg-gray-100 transition-colors">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm leading-tight group-hover:text-gray-700 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </Link>
            );
          }
          // Text-only items (Solutions) — clean minimal style
          return (
            <Link
              key={index}
              to={item.to || '#'}
              role="menuitem"
              className="block px-5 py-3.5 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0"
              onClick={() => setActiveDropdown(null)}
            >
              <p className="text-sm font-medium text-gray-900 mb-0.5">{item.label}</p>
              <p className="text-xs text-gray-400">{item.subtitle}</p>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <nav 
        ref={navRef} 
        className={`w-full transition-all duration-500 h-[72px] lg:h-[80px] ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full h-full px-4 lg:px-8">
          {/* Main Navigation */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 hover:no-underline">
              <div className="w-9 h-9 rounded-none bg-black flex items-center justify-center shadow-lg shadow-black/20">
                <Zap size={20} color="white" fill="white" strokeWidth={1} />
              </div>
              <span className={`text-xl font-bold tracking-tight transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                ChargeNet
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <Link 
                to="/map" 
                onMouseEnter={prefetchStations}
                className={`font-medium transition-all relative py-1 ${
                  isActive('/map')
                    ? isScrolled ? 'text-emerald-600' : 'text-white'
                    : isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'
                }`}
              >
                Find Stations
                {isActive('/map') && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isScrolled ? 'bg-emerald-500' : 'bg-white'} rounded-full`}></span>
                )}
              </Link>
              <Link 
                to="/booking" 
                className={`font-medium transition-all relative py-1 ${
                  isPartiallyActive('/booking')
                    ? isScrolled ? 'text-emerald-600' : 'text-white'
                    : isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'
                }`}
              >
                Book a Slot
                {isPartiallyActive('/booking') && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isScrolled ? 'bg-emerald-500' : 'bg-white'} rounded-full`}></span>
                )}
              </Link>
              <Link 
                to="/pricing" 
                className={`font-medium transition-all relative py-1 ${
                  isActive('/pricing')
                    ? isScrolled ? 'text-emerald-600' : 'text-white'
                    : isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'
                }`}
              >
                Pricing
                {isActive('/pricing') && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isScrolled ? 'bg-emerald-500' : 'bg-white'} rounded-full`}></span>
                )}
              </Link>
            </div>
          </div>

          {/* Actions & Resources */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="relative flex items-center h-full">
              <DropdownTrigger name="solutions" label="Solutions" />
              <DropdownMenu name="solutions" items={navData.solutions} alignRight />
            </div>
            <div className="relative flex items-center h-full">
              <DropdownTrigger name="resources" label="Resources" />
              <DropdownMenu name="resources" items={navData.resources} alignRight />
            </div>

            <div className={`h-6 w-px transition-colors ${isScrolled ? 'bg-gray-200' : 'bg-white/20'} mx-1`}></div>

            <button className={`relative p-2 rounded-none transition-colors flex items-center justify-center ${
              isScrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}>
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-transparent"></span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`px-5 py-2.5 font-semibold rounded-none transition-all ${
                  isScrolled 
                    ? 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200' 
                    : 'text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 font-bold text-black bg-white hover:bg-gray-100 rounded-none transition-all shadow-lg shadow-white/10"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 ml-4 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              <svg className="w-6 h-6" fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-4 absolute top-full left-0 w-full shadow-lg">
            <Link to="/map" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">
              Find Stations
            </Link>
            <Link to="/booking" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">
              Book a Slot
            </Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block text-sm text-gray-400 hover:text-gray-600">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-900">
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
