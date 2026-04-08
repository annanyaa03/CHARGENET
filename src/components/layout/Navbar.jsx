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
  findCharger: [
    { icon: MapPin, label: 'Map View', subtitle: 'Browse stations near you', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Zap, label: 'DC Fast Charging', subtitle: 'High-speed stations', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Plug, label: 'AC Slow Charging', subtitle: 'Overnight & extended stays', color: 'text-amber-600', bg: 'bg-amber-50' },
    { divider: true },
    { icon: CalendarCheck, label: 'Book a Slot', subtitle: 'Reserve in advance', color: 'text-red-600', bg: 'bg-red-50' },
  ],
  planTrip: [
    { icon: MapIcon, label: 'Route Planner', subtitle: 'Find stops along your route', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: BatteryMedium, label: 'Range Calculator', subtitle: 'Estimate charge needed', color: 'text-blue-600', bg: 'bg-blue-50' },
  ],
  learn: [
    { icon: BookOpen, label: 'EV Guide', subtitle: 'New to EVs? Start here', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Lightbulb, label: 'Charging Tips', subtitle: 'Best practices & tricks', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Newspaper, label: 'Blog', subtitle: 'News & updates', color: 'text-blue-600', bg: 'bg-blue-50' },
  ]
};

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);

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

  const DropdownTrigger = ({ name, label, icon: Icon }) => {
    const isOpen = activeDropdown === name;
    return (
      <button
        onClick={() => toggleDropdown(name)}
        className="flex items-center gap-1.5 hover:text-gray-900 text-gray-700 font-medium px-2 py-1 transition-colors"
      >
        {Icon && <Icon size={18} className="text-gray-500" strokeWidth={2} />}
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    );
  };

  const DropdownMenu = ({ name, items, alignRight = false }) => {
    if (activeDropdown !== name) return null;
    return (
      <div
        className={`absolute top-full mt-3 w-72 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50 ${
          alignRight ? 'right-0' : 'left-0'
        }`}
      >
        {items.map((item, index) => {
          if (item.divider) {
            return <div key={index} className="h-px bg-gray-100 my-2 mx-4" />;
          }
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to="#"
              className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 transition-colors mx-2 rounded-lg"
              onClick={() => setActiveDropdown(null)}
            >
              <div className={`p-2.5 rounded-xl ${item.bg}`}>
                <Icon size={20} className={item.color} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-[15px]">{item.label}</div>
                <div className="text-[13px] text-gray-500 mt-0.5">{item.subtitle}</div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <nav ref={navRef} className="sticky top-0 z-40 bg-white border-b border-gray-200 h-[56px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Zone */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-gray-900 hover:no-underline">
              <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center">
                <Zap size={18} color="white" fill="white" strokeWidth={1} />
              </div>
              <span className="text-lg font-medium tracking-tight">ChargeNet</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="relative flex items-center h-full">
                <DropdownTrigger name="findCharger" label="Find Charger" icon={MapPin} />
                <DropdownMenu name="findCharger" items={navData.findCharger} />
              </div>
              <Link to="/pricing" className="text-gray-700 hover:text-gray-900 font-medium">
                Pricing
              </Link>
            </div>
          </div>

          {/* Right Zone */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            <div className="flex items-center gap-5">
              <div className="relative flex items-center h-full">
                <DropdownTrigger name="planTrip" label="Plan Trip" icon={Route} />
                <DropdownMenu name="planTrip" items={navData.planTrip} alignRight />
              </div>
              <div className="relative flex items-center h-full">
                <DropdownTrigger name="learn" label="Learn" icon={BookOpen} />
                <DropdownMenu name="learn" items={navData.learn} alignRight />
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 font-medium text-white bg-[#1D9E75] hover:bg-[#168561] border border-transparent rounded-lg transition-colors shadow-sm"
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
