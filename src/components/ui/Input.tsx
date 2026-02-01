'use client'

import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full h-12 px-4 bg-white border rounded-lg text-text-primary
          placeholder:text-text-placeholder
          focus:border-border-focus focus:ring-1 focus:ring-border-focus
          ${error ? 'border-action-danger' : 'border-border'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-action-danger">{error}</p>
      )}
    </div>
  )
}
