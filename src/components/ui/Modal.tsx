'use client'

import { ReactNode, useEffect } from 'react'
import { Button } from './Button'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
        {actions && (
          <div className="flex gap-3 p-4 border-t border-border">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
