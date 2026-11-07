import { useEffect, useRef, useState } from "react"
import { MoreVertical } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"

/**
 * Per-row overflow menu. `items` are descriptors - `{ key, label, icon, onSelect,
 * disabled, danger }` - so callers describe actions instead of building markup.
 *
 * Opens upward when the trigger sits in the lower half of the viewport, which is
 * the common case for the last rows of a long table.
 */
export default function RowMenu({ items }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  if (!items?.length) {
    return null
  }

  const toggle = () => {
    const trigger = rootRef.current?.querySelector(".row-menu__trigger")
    if (trigger) {
      const box = trigger.getBoundingClientRect()
      setDropUp(box.bottom > window.innerHeight - 200)
    }
    setOpen((value) => !value)
  }

  const select = (item) => {
    if (item.disabled) {
      return
    }
    setOpen(false)
    item.onSelect?.()
  }

  return (
    <div className="row-menu" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("res.moreActions")}
        className="row-menu__trigger"
        onClick={toggle}
        title={t("res.moreActions")}
        type="button"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className={`row-menu__panel${dropUp ? " row-menu__panel--up" : ""}`} role="menu">
          {items.map((item) => (
            <button
              aria-disabled={item.disabled || undefined}
              className={`row-menu__item${item.danger ? " row-menu__item--danger" : ""}`}
              disabled={item.disabled}
              key={item.key}
              onClick={() => select(item)}
              role="menuitem"
              type="button"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}