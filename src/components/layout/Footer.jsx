import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, MapPin, BookOpen, Mail, Twitter, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <Zap size={16} color="white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-semibold text-primary">ChargeNet</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              India's smart EV charging companion. Find, book, and manage charging — everywhere you go.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted hover:text-primary transition-colors hover:no-underline"><Twitter size={16} /></a>
              <a href="#" className="text-muted hover:text-primary transition-colors hover:no-underline"><Github size={16} /></a>
              <a href="mailto:hello@chargenet.in" className="text-muted hover:text-primary transition-colors hover:no-underline"><Mail size={16} /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Product</h4>
            <ul className="space-y-2">
              {[
                { to: '/map', label: 'Find Chargers' },
                { to: '/learn', label: 'Learn Hub' },
                { to: '/register', label: 'Get Started' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted hover:text-accent transition-colors hover:no-underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Owners */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Station Owners</h4>
            <ul className="space-y-2">
              {[
                { to: '/owner/dashboard', label: 'Owner Portal' },
                { to: '/learn/guide-012', label: 'List Your Station' },
                { to: '/owner/analytics', label: 'Analytics' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted hover:text-accent transition-colors hover:no-underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Platform Stats</h4>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm"><span className="text-muted">Total Stations</span><span className="font-medium text-primary">10</span></li>
              <li className="flex justify-between text-sm"><span className="text-muted">Cities</span><span className="font-medium text-primary">5</span></li>
              <li className="flex justify-between text-sm"><span className="text-muted">Active Chargers</span><span className="font-medium text-primary">30</span></li>
              <li className="flex justify-between text-sm"><span className="text-muted">Reviews</span><span className="font-medium text-primary">385+</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">© 2025 ChargeNet. Made with ♥ for India's EV community.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-muted hover:text-accent hover:no-underline">Privacy</a>
            <a href="#" className="text-xs text-muted hover:text-accent hover:no-underline">Terms</a>
            <a href="#" className="text-xs text-muted hover:text-accent hover:no-underline">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
