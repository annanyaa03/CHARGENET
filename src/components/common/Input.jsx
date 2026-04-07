import React from 'react'

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon size={16} />
          </span>
        )}
        <input
          id={inputId}
          className={[
            'w-full bg-surface border border-border rounded-lg text-primary placeholder:text-muted',
            'text-sm px-3 py-2 outline-none transition-all duration-150',
            'focus:border-accent focus:ring-2 focus:ring-accent/20',
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
            Icon ? 'pl-9' : '',
            IconRight ? 'pr-9' : '',
          ].join(' ')}
          {...props}
        />
        {IconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            <IconRight size={16} />
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', id, rows = 4, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={[
          'w-full bg-surface border border-border rounded-lg text-primary placeholder:text-muted',
          'text-sm px-3 py-2 outline-none transition-all duration-150 resize-none',
          'focus:border-accent focus:ring-2 focus:ring-accent/20',
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, hint, className = '', id, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={[
          'w-full bg-surface border border-border rounded-lg text-primary',
          'text-sm px-3 py-2 outline-none transition-all duration-150',
          'focus:border-accent focus:ring-2 focus:ring-accent/20',
          error ? 'border-danger' : '',
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
