import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, ChevronRight, Clock, Tag } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { LevelBadge } from '../components/common/Badge'
import { guides } from '../mock/guides'

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Owner']

function GuideCard({ guide }) {
  const navigate = useNavigate()
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col h-full hover:border-accent transition-colors cursor-pointer group"
         onClick={() => navigate(`/learn/${guide.id}`)}
         style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-3">
        <LevelBadge level={guide.level} />
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} />
          <span>{guide.stepCount} steps</span>
        </div>
      </div>
      <h3 className="text-base font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
        {guide.title}
      </h3>
      <p className="text-sm text-muted line-clamp-3 mb-4 flex-1">
        {guide.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {guide.tags.slice(0, 3).map(tag => (
          <span key={tag} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-background border border-border rounded-full text-muted">
            <Tag size={10} /> {tag}
          </span>
        ))}
      </div>
      <Button variant="outline" size="sm" fullWidth className="group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
        Read Guide <ChevronRight size={14} />
      </Button>
    </div>
  )
}

export default function LearnHub() {
  const navigate = useNavigate()
  const [activeLevel, setActiveLevel] = useState('All')

  const filteredGuides = useMemo(() => {
    if (activeLevel === 'All') return guides
    return guides.filter(g => g.level.toLowerCase() === activeLevel.toLowerCase())
  }, [activeLevel])

  useEffect(() => {
    document.title = 'Learn EV Hub — ChargeNet'
  }, [])

  return (
    <PageWrapper>
      <section className="bg-background border-b border-border">
        <PageContainer className="py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-medium text-[#1D4ED8] mb-6">
            <GraduationCap size={14} /> Knowledge Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-primary leading-tight mb-4">
            Learn EV — guides for<br className="hidden md:block" /> every stage
          </h1>
          <p className="text-base text-muted max-w-xl mx-auto mb-2">
            Everything from buying your first EV to managing a commercial charging station.
            Simplified for India&apos;s growing EV ecosystem.
          </p>
        </PageContainer>
      </section>

      <PageContainer>
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`filter-pill flex-shrink-0 ${activeLevel === level ? 'active' : ''}`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-xl mb-12">
            <BookOpen size={40} className="text-border mx-auto mb-4" />
            <p className="text-sm font-medium text-primary">No guides found for this level</p>
            <p className="text-xs text-muted mt-1">Try another filter or check back later.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveLevel('All')}>
              Show All Guides
            </Button>
          </div>
        )}

        {/* Categories Section */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 className="text-base font-semibold text-primary mb-3">Popular for Beginners</h2>
            <div className="space-y-3">
              {guides.filter(g => g.level === 'beginner').slice(0, 3).map(g => (
                <div key={g.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/learn/${g.id}`)}>
                  <p className="text-sm text-muted group-hover:text-accent transition-colors truncate pr-4">{g.title}</p>
                  <ChevronRight size={14} className="text-border group-hover:text-accent" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 className="text-base font-semibold text-primary mb-3">For Station Owners</h2>
            <div className="space-y-3">
              {guides.filter(g => g.level === 'owner').slice(0, 3).map(g => (
                <div key={g.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/learn/${g.id}`)}>
                  <p className="text-sm text-muted group-hover:text-accent transition-colors truncate pr-4">{g.title}</p>
                  <ChevronRight size={14} className="text-border group-hover:text-accent" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageContainer>
    </PageWrapper>
  )
}
