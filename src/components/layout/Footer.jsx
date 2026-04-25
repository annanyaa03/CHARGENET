import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, MapPin, Phone } from 'lucide-react';


export function Footer() {
  return (
    <footer className="bg-[#040d1a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Tagline */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 hover:no-underline">
              <div className="w-8 h-8 rounded-none bg-[#1D9E75] flex items-center justify-center">
                <Zap size={18} color="white" fill="white" strokeWidth={1} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ChargeNet</span>
            </Link>
            <p className="text-gray-400 text-[15px] leading-relaxed">
              India&apos;s most trusted EV charging network, powering 5+ cities with 500+ stations. Charge your journey with confidence.
            </p>

          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              {[
                { name: 'Find Chargers', path: '/map' },
                { name: 'Pricing', path: '/pricing' },
                { name: 'Plan Trip', path: '/map' },
                { name: 'Mobile App', path: '/learn' },
                { name: 'Live Status', path: '/map' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-400 hover:text-[#1D9E75] transition-colors text-[15px] hover:no-underline">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Coverage Map', path: '/map' },
                { name: 'Careers', path: '#' },
                { name: 'Partner With Us', path: '/solutions/business' },
                { name: 'Blog', path: '/resources/blog' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-400 hover:text-[#1D9E75] transition-colors text-[15px] hover:no-underline">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-[15px]">
                <Mail size={18} className="text-[#1D9E75]" />
                support@chargenet.in
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-[15px]">
                <Phone size={18} className="text-[#1D9E75]" />
                +91 800 123 4567
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-[15px]">
                <MapPin size={18} className="text-[#1D9E75] mt-1" />
                <span>Level 12, Cyber Tower,<br />Hyderabad, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ChargeNet. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="#" className="text-gray-500 hover:text-white text-sm hover:no-underline">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 hover:text-white text-sm hover:no-underline">Terms of Service</Link>
            <Link to="#" className="text-gray-500 hover:text-white text-sm hover:no-underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
