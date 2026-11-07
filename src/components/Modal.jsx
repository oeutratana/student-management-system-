import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"

// The app has no component library, so this is the single overlay primitive.
// Escape and backdrop clicks close it and the page behind it stops scrolling
// while it is open.
export default function Modal({ open, onClose, title, subtitle, icon, children, footer, size = "max-w-xl" }) {
  const { t } = useLanguage()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.focus()

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`relative flex max-h-[90vh] w-full ${size} flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl`}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            {icon}
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900" id="modal-title">
                {title}
              </h2>
              {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            aria-label={t("modal.close")}
            className="flex-none rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}