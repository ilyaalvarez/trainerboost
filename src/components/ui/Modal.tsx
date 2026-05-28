'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /** Controls max-width of the dialog panel */
  size?: 'sm' | 'md' | 'lg'
  /** Hides the default header (title + close btn). Use when you supply your own. */
  hideHeader?: boolean
  className?: string
}

// ─── Size map ──────────────────────────────────────────────────────────────────

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideHeader = false,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // ── Keyboard: close on Escape ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // ── Scroll-lock while open ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Click outside → close ──────────────────────────────────────────────────
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose()
  }

  if (!isOpen) return null

  // ── Portal into document.body ──────────────────────────────────────────────
  return createPortal(
    /*
     * Full-screen overlay with backdrop blur.
     * The dialog panel slides up via the `animate-slide-up` animation defined
     * in tailwind.config.ts (already present in this project).
     */
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4',
        // Backdrop
        'bg-[#0F172A]/70 backdrop-blur-sm',
        // Fade-in the overlay itself
        'animate-fade-in',
      )}
    >
      {/* Dialog panel */}
      <div
        className={cn(
          'relative w-full rounded-2xl',
          'bg-[#1E293B] border border-[#334155]',
          'shadow-[0_24px_48px_rgba(0,0,0,0.55)]',
          'flex flex-col max-h-[calc(100dvh-2rem)]',
          // Slide-up animation
          'animate-slide-up',
          sizeClasses[size],
          className,
        )}
      >
        {/* ── Header ── */}
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155] shrink-0">
            <h2
              id="modal-title"
              className="text-[#F1F5F9] font-semibold text-base leading-snug"
            >
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={cn(
                'flex items-center justify-center',
                'w-7 h-7 rounded-lg',
                'text-[#94A3B8] hover:text-[#F1F5F9]',
                'hover:bg-[#334155] active:bg-[#475569]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]',
              )}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* ── Body (scrollable) ── */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
