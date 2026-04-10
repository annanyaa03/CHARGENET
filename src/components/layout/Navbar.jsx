import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Plug,
  CalendarCheck,
  Map as MapIcon,
  BatteryMedium,
  BookOpen,
  Lightbulb,
  Newspaper,
  Bell,
  ChevronDown,
  Route
} from 'lucide-react';

const navData = {
  solutions: [
    { icon: Route, label: 'For Individuals', subtitle: 'Home charging solutions', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: BatteryMedium, label: 'For Business', subtitle: 'Workplace & retail charging', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Newspaper, label: 'Fleet Solutions', subtitle: 'Scaling your EV fleet', color: 'text-amber-600', bg: 'bg-amber-50' },
  ],
  resources: [
    { icon: BookOpen, label: 'Charging Guide', subtitle: 'Everything you need to know', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Lightbulb, label: 'Help Center', subtitle: 'Support & documentation', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Newspaper, label: 'Latest Blog', subtitle: 'Industry news & updates', color: 'text-teal-600', bg: 'bg-teal-50' },
  ]
};

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
        className={`flex items-center gap-1.5 font-medium px-2 py-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9EFF] rounded-lg ${
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
        className={`absolute top-full mt-3 w-80 bg-white rounded-xl border border-gray-100 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
          alignRight ? 'right-0' : 'left-0'
        }`}
      >
        {items.map((item, index) => {
          if (item.divider) {
            return <div key={index} className="h-px bg-gray-100 my-2 mx-4" role="separator" />;
          }
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to="#"
              role="menuitem"
              className="flex items-start gap-3.5 px-4 py-3 hover:bg-gray-50 transition-all mx-2 rounded-lg text-left group"
              onClick={() => setActiveDropdown(null)}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:text-[#4A9EFF] group-hover:bg-[#4A9EFF]/5 transition-colors">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-[14px] leading-tight group-hover:text-[#4A9EFF] transition-colors">
                  {item.label}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5 font-medium">
                  {item.subtitle}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <nav 
      ref={navRef} 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[72px] ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Main Navigation */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 hover:no-underline">
              <div className="w-9 h-9 rounded-lg bg-[#4A9EFF] flex items-center justify-center shadow-lg shadow-[#4A9EFF]/20">
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
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-white/80'
                }`}
              >
                Find Stations
              </Link>
              <Link 
                to="/bookings" 
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-white/80'
                }`}
              >
                Book a Slot
              </Link>
              <Link 
                to="/pricing" 
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-white/80'
                }`}
              >
                Pricing
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

            <button className={`relative p-2 rounded-full transition-colors flex items-center justify-center ${
              isScrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}>
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-transparent"></span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`px-5 py-2.5 font-semibold rounded-xl transition-all ${
                  isScrolled 
                    ? 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200' 
                    : 'text-[#7ab8f5] bg-[#1a3a5a]/10 hover:bg-[#1a3a5a]/20 backdrop-blur-sm border border-[#1a3a5a]'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 font-semibold text-[#020d1a] bg-[#4A9EFF] hover:bg-[#3d8be0] rounded-xl transition-all shadow-lg shadow-[#4A9EFF]/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
