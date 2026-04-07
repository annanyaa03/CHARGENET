import React from 'react'

const statusConfig = {
  active: { dot: 'bg-success', text: 'text-success', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Active' },
  busy: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Busy' },
  inactive: { dot: 'bg-danger', text: 'text-danger', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', label: 'Inactive' },
  faulty: { dot: 'bg-neutral', text: 'text-neutral', bg: 'bg-[#FAFAF9]', border: 'border-border', label: 'Faulty' },
  success: { dot: 'bg-success', text: 'text-success', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Success' },
  warning: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Warning' },
  danger: { dot: 'bg-danger', text: 'text-danger', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', label: 'Danger' },
  neutral: { dot: 'bg-neutral', text: 'text-neutral', bg: 'bg-surface', border: 'border-border', label: 'Neutral' },
  pending: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Pending' },
  approved: { dot: 'bg-success', text: 'text-success', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Approved' },
  rejected: { dot: 'bg-danger', text: 'text-danger', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', label: 'Rejected' },
}

export function Badge({ variant = 'neutral', label, showDot = true, className = '' }) {
  const cfg = statusConfig[variant] || statusConfig.neutral
  const displayLabel = label || cfg.label

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        cfg.bg, cfg.border, cfg.text,
        className,
      ].join(' ')}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
      {displayLabel}
    </span>
  )
}

export function LevelBadge({ level }) {
  const config = {
    beginner: { label: 'Beginner', bg: 'bg-[#F0FDF4]', text: 'text-success', border: 'border-[#BBF7D0]' },
    intermediate: { label: 'Intermediate', bg: 'bg-[#F0FDFA]', text: 'text-accent', border: 'border-[#99F6E4]' },
    advanced: { label: 'Advanced', bg: 'bg-[#FFFBEB]', text: 'text-warning', border: 'border-[#FDE68A]' },
    owner: { label: 'Owner', bg: 'bg-[#FEF2F2]', text: 'text-danger', border: 'border-[#FECACA]' },
  }
  const cfg = config[level] || config.beginner
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

export function PlugBadge({ plugType }) {
  const config = {
    CCS2: { bg: 'bg-[#F0FDFA]', text: 'text-accent', border: 'border-[#99F6E4]' },
    Type2: { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#BFDBFE]' },
    CHAdeMO: { bg: 'bg-[#FFFBEB]', text: 'text-warning', border: 'border-[#FDE68A]' },
    NACS: { bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]' },
  }
  const cfg = config[plugType] || config.Type2
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {plugType === 'Type2' ? 'Type 2' : plugType}
    </span>
  )
}
