import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, ChevronRight, Clock, Tag } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { LevelBadge } from '../components/common/Badge'
import { guides } from '../mock/guides'

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Owner']

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

        {/* Guide List */}
        {filteredGuides.length > 0 ? (
          <div className="flex flex-col mb-12" style={{ borderTop: '1px solid var(--color-border)' }}>
            {filteredGuides.map(guide => (
              <div
                key={guide.id}
                onClick={() => navigate(`/learn/${guide.id}`)}
                className="group cursor-pointer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                  padding: '20px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {/* Left: meta + title + desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <LevelBadge level={guide.level} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-muted)' }}>
                      <Clock size={12} /> {guide.stepCount} steps
                    </span>
                    {guide.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        fontSize: '10px', fontWeight: 500,
                        padding: '2px 8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '999px',
                        color: 'var(--color-muted)',
                      }}>
                        <Tag size={9} /> {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="group-hover:text-accent transition-colors" style={{
                    fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0',
                    color: 'var(--color-primary)', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {guide.title}
                  </h3>
                  <p style={{
                    fontSize: '13px', color: 'var(--color-muted)', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                  }}>
                    {guide.description}
                  </p>
                </div>

                {/* Right: Read Guide arrow */}
                <div
                  className="group-hover:text-accent transition-colors flex-shrink-0"
                  style={{ color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}
                >
                  Read Guide <ChevronRight size={16} />
                </div>
              </div>
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
