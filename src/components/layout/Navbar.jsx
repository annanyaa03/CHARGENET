
const navData = {
  solutions: [
    { label: 'For Individuals', subtitle: 'Personal charging solutions',    to: '/solutions/individuals' },
    { label: 'For Business',    subtitle: 'Workplace and retail charging',  to: '/solutions/business' },
    { label: 'Fleet Solutions', subtitle: 'Scale your EV fleet',            to: '/solutions/fleet' },
  ],
  resources: [
    { label: 'Charging Guide', subtitle: 'Everything you need to know',  to: '/resources/charging-guide' },
    { label: 'Help Center',    subtitle: 'Support and documentation',    to: '/resources/help' },
    { label: 'Latest Blog',    subtitle: 'Industry news and updates',    to: '/resources/blog' },
  ]
};

// Prefetch function for stations using the unified Express API service
const prefetchStations = async () => {
  try {
    const cached = localStorage.getItem('chargenet_stations');
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      const isOld = Date.now() - timestamp > 5 * 60 * 1000;
      if (!isOld) return; // Already cached and fresh
    }

    const res = await getStations({ limit: 100 });
    
    if (res.success && res.data) {
      localStorage.setItem(
        'chargenet_stations',
        JSON.stringify({
          data: res.data,
          timestamp: Date.now()
        })
      );
      console.log('[Navbar] Stations prefetched successfully from Express API');
    }
  } catch (err) {
    console.error('[Navbar] Prefetch error:', err);
  }
};

export function Navbar({ solid = false }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolledState, setIsScrolledState] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isScrolled = solid || isScrolledState;
  const navRef = useRef(null);

  // --- Notifications State ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', title: 'Booking confirmed', message: 'Your slot at Mumbai BKC EV Station is confirmed for today at 3:00 PM.', time: '2 mins ago', read: false },
    { id: 2, type: 'charger', title: 'Charger now available', message: 'A CCS charger at Pune Hinjewadi Tech Park is now free.', time: '15 mins ago', read: false },
    { id: 3, type: 'session', title: 'Charging session complete', message: 'Your session at Delhi Connaught Place ended. Total: ₹124.50', time: '1 hour ago', read: true },
    { id: 4, type: 'promo', title: 'Weekend offer', message: 'Get 20% off all Type 2 charging sessions this weekend with Pro plan.', time: '2 hours ago', read: true },
    { id: 5, type: 'system', title: 'New station added', message: 'Bengaluru Whitefield EV Hub is now live with 4 chargers near you.', time: 'Yesterday', read: true }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUserNotifications = async () => {
      if (!user) return
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        
        // Get current session token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) return
        
        const response = await fetch(`${API_URL}/api/v1/bookings`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          // Silent fail - notifications are not critical
          return
        }
        
        const result = await response.json()
        const bookings = result.data?.bookings || []
        
        if (bookings.length === 0) return
        
        const bookingNotifs = bookings.slice(0, 5).map(b => ({
          id: b.id,
          type: 'booking',
          title: b.status === 'confirmed' ? 'Booking confirmed' : `Booking ${b.status}`,
          message: `${b.stations?.name || 'Station'} on ${b.booking_date} at ${b.booking_time}`,
          time: new Date(b.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
          }),
          read: false
        }))
        
        setNotifications(prev => [
          ...bookingNotifs,
          ...prev.filter(n => n.type !== 'booking')
        ])
      } catch (err) {
        // Silent fail - dont show errors for notifications
        return
      }
    }
    fetchUserNotifications()
  }, [user]);



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
            <Link
              to="/"
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
              ChargeNet
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

            <div className="relative" ref={notificationRef}>
              {/* Bell Button */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-9 h-9 flex items-center justify-center transition-all ${
                  isScrolled ? 'text-gray-500 hover:text-gray-900 bg-transparent' : 'text-white hover:bg-white/10'
                }`}>
                
                {/* Bell icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>

                {/* Unread dot */}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gray-900 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-lg z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-900">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-gray-900 text-white px-2 py-0.5">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-gray-600 transition-all">
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-sm text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markRead(notif.id)}
                          className={`px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all last:border-0 ${!notif.read ? 'bg-gray-50' : 'bg-white'}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1.5">
                              {!notif.read ? (
                                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs mb-0.5 ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{notif.message}</p>
                              <p className="text-xs text-gray-300">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/dashboard');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 transition-all w-full text-center">
                      View all in dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>

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
