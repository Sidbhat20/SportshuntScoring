'use client'

import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'warning'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-action-primary text-white hover:bg-gray-800 active:bg-gray-900',
  secondary: 'bg-action-secondary text-text-primary hover:bg-gray-200 active:bg-gray-300',
  outline: 'bg-white border border-border text-text-primary hover:bg-gray-50 active:bg-gray-100',
  danger: 'bg-action-danger text-white hover:bg-red-700 active:bg-red-800',
  success: 'bg-action-success text-white hover:bg-green-700 active:bg-green-800',
  ghost: 'bg-transparent text-text-muted hover:bg-gray-100 active:bg-gray-200',
  warning: 'bg-action-warning text-white hover:bg-amber-600 active:bg-amber-700',
}

const sizeClasses = {
  sm: 'px-3 py-2 min-h-[40px] text-sm',
  md: 'px-4 py-3 min-h-[48px]',
  lg: 'px-6 py-4 min-h-[56px] text-lg',
}

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  size = 'md',
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium select-none
        touch-manipulation transition-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

type IconButtonProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  title?: string
}

export function IconButton({ children, onClick, className = '', disabled = false, title }: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`
        inline-flex items-center justify-center w-11 h-11 rounded-lg text-text-muted
        hover:bg-gray-100 active:bg-gray-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
