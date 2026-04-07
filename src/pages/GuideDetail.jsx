import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Info, AlertTriangle, Lightbulb, Clock, Share2, Bookmark } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { LevelBadge } from '../components/common/Badge'
import { guides } from '../mock/guides'
import toast from 'react-hot-toast'

export default function GuideDetail() {
  const { guideId } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const guide = guides.find(g => g.id === guideId)

  useEffect(() => {
    if (guide) document.title = `${guide.title} — ChargeNet Learn`
  }, [guide])

  if (!guide) return (
    <PageWrapper><PageContainer><p className="text-muted">Guide not found.</p></PageContainer></PageWrapper>
  )

  const step = guide.content.steps[currentStep]
  const progress = ((currentStep + 1) / guide.stepCount) * 100

  const handleNext = () => {
    if (currentStep < guide.stepCount - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo(0, 0)
    } else {
      setIsCompleted(true)
      toast.success('Congratulations! You completed the guide.')
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const renderIconBox = (type, text) => {
    const configs = {
      tip: { icon: Lightbulb, bg: 'bg-[#F0FDF4]', text: 'text-success', border: 'border-[#BBF7D0]' },
      warning: { icon: AlertTriangle, bg: 'bg-[#FEF2F2]', text: 'text-danger', border: 'border-[#FECACA]' },
      info: { icon: Info, bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#BFDBFE]' },
    }
    const cfg = configs[type] || configs.info
    const Icon = cfg.icon
    return (
      <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} flex gap-3 my-6`}>
        <Icon size={18} className={`${cfg.text} flex-shrink-0 mt-0.5`} />
        <p className={`text-sm ${cfg.text} leading-relaxed`}>{text}</p>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <PageWrapper>
        <PageContainer className="max-w-2xl py-16 text-center">
          <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-semibold text-primary mb-2">Guide Completed!</h1>
          <p className="text-base text-muted mb-8">
            You've successfully finished: <span className="font-medium text-primary">{guide.title}</span>.
            You're now one step closer to becoming an EV expert.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/learn')}>Back to Learn Hub</Button>
            <Button variant="outline" onClick={() => { setIsCompleted(false); setCurrentStep(0) }}>Re-read Guide</Button>
          </div>
        </PageContainer>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <PageContainer className="max-w-3xl">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/learn')} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back to Hub
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted hover:text-primary hover:bg-surface rounded-lg transition-colors"><Bookmark size={18} /></button>
            <button className="p-2 text-muted hover:text-primary hover:bg-surface rounded-lg transition-colors"><Share2 size={18} /></button>
          </div>
        </div>

        {/* Guide Title & Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LevelBadge level={guide.level} />
            <span className="text-xs text-muted font-medium flex items-center gap-1">
              <Clock size={12} /> {guide.stepCount * 2} min read
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-primary mb-4 leading-tight">{guide.title}</h1>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span>Step {currentStep + 1} of {guide.stepCount}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-1.5 w-full bg-surface border border-border rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <section className="guide-content bg-surface border border-border rounded-2xl p-6 md:p-8 mb-8" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <h2 className="text-xl font-semibold text-primary mb-4">{step.title}</h2>
          <div className="space-y-4 text-primary leading-relaxed">
            {step.desc.split('\n').map((para, i) => para.trim() && (
              <p key={i} className="text-base text-muted">{para}</p>
            ))}
          </div>

          {step.type === 'tip' && renderIconBox('tip', step.bonus)}
          {step.type === 'warning' && renderIconBox('warning', step.bonus)}
          {step.type === 'info' && renderIconBox('info', step.bonus)}

          {/* Points List */}
          {step.points && (
            <ul className="mt-6 space-y-3">
              {step.points.map((pt, i) => (
                <li key={i} className="flex gap-3 text-sm text-primary leading-relaxed">
                  <div className="w-5 h-5 bg-[#F0FDFA] rounded-full flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  {pt}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="hidden sm:flex">
            Previous
          </Button>
          <div className="flex-1 sm:hidden"></div>
          <Button variant="primary" onClick={handleNext} className="min-w-[140px]">
            {currentStep === guide.stepCount - 1 ? 'Finish Guide' : 'Next Step'} <ArrowRight size={16} />
          </Button>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
