import React from 'react'

const variants = {
  primary: 'bg-accent text-white hover:bg-[#0D6560] focus:ring-2 focus:ring-accent/30',
  outline: 'bg-transparent border border-border text-primary hover:bg-surface',
  ghost: 'bg-transparent text-muted hover:text-primary hover:bg-surface',
  danger: 'bg-danger text-white hover:bg-[#991B1B] focus:ring-2 focus:ring-danger/30',
  success: 'bg-success text-white hover:bg-[#166534] focus:ring-2 focus:ring-success/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : Icon ? (
        <Icon size={14} strokeWidth={2} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={14} strokeWidth={2} />}
    </button>
  )
}
