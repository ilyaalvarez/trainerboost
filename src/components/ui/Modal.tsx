'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  hideHeader?: boolean
  className?: string
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', hideHeader = false, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in bg-black/60 backdrop-blur-sm"
    >
      <div
        className={cn(
          'relative w-full rounded-xl bg-surface border border-border flex flex-col max-h-[calc(100dvh-2rem)]',
          'animate-modal-in shadow-modal',
          sizeClasses[size],
          className,
        )}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-border">
            <h2 id="modal-title" className="text-fg-primary font-semibold text-base leading-snug">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="btn-icon"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto overscroll-contain flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
