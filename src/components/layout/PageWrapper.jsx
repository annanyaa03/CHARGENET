import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export function PageWrapper({ children, noFooter = false, noPadding = false }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`flex-1 ${noPadding ? '' : 'page-enter'}`}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  )
}

export function PageContainer({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 ${className}`}>
      {children}
    </div>
  )
}
