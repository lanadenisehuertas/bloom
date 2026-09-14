import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Escape must always dismiss — a sheet with no keyboard exit traps keyboard users.
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Move focus into the sheet when it opens so screen readers land in the right place.
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-block bg-cream p-5 outline-none sm:rounded-block"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-xl font-extrabold">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-cream-deep text-ink-900 transition-colors duration-200 active:bg-cream-edge"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
