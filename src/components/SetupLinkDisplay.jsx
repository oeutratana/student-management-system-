import { useRef, useState } from "react"
import { Check, Copy, Download, ExternalLink, QrCode, X } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { useLanguage } from "../context/LanguageContext"

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand("copy")
  } finally {
    document.body.removeChild(textarea)
  }
}

const buttonBase =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
const buttonMuted =
  "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"

export default function SetupLinkDisplay({ link, onCopied, alwaysShowQr = false, fileName = "account-setup-qr.png" }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(alwaysShowQr)
  const canvasRef = useRef(null)

  // The QR is pinned open inside dialogs, where a collapsed code would hide the
  // whole point of the popup.
  const qrVisible = alwaysShowQr || showQr

  const handleCopy = async () => {
    try {
      await copyToClipboard(link)
      setCopied(true)
      onCopied?.()
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const anchor = document.createElement("a")
    anchor.href = canvas.toDataURL("image/png")
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  return (
    <div className="grid gap-3">
      <div>
        <span className="text-[13px] font-bold text-slate-600">{t("setpw.linkLabel")}</span>
        <code className="mt-1 block break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-semibold text-indigo-700">
          {link}
        </code>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`${buttonBase} bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70`}
          onClick={handleCopy}
          type="button"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t("setpw.linkCopied") : t("setpw.copyLink")}
        </button>
        <a
          className={`${buttonBase} ${buttonMuted}`}
          href={link}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink size={16} />
          {t("setpw.openLink")}
        </a>
        {!alwaysShowQr && (
          <button
            aria-expanded={qrVisible}
            className={`${buttonBase} ${buttonMuted}`}
            onClick={() => setShowQr((value) => !value)}
            type="button"
          >
            {qrVisible ? <X size={16} /> : <QrCode size={16} />}
            {qrVisible ? t("setpw.hideQr") : t("setpw.showQr")}
          </button>
        )}
        {qrVisible && (
          <button
            className={`${buttonBase} ${buttonMuted}`}
            onClick={handleDownload}
            type="button"
          >
            <Download size={16} />
            {t("setpw.downloadQr")}
          </button>
        )}
      </div>

      {qrVisible && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5">
          <QRCodeCanvas
            bgColor="#ffffff"
            fgColor="#0f172a"
            includeMargin
            level="H"
            ref={canvasRef}
            size={240}
            value={link}
          />
          <p className="max-w-xs text-center text-xs font-semibold text-slate-500">
            {t("setpw.qrHint")}
          </p>
        </div>
      )}
    </div>
  )
}