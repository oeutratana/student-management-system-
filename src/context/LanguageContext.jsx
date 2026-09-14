import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { messages } from "../translations"

const LanguageContext = createContext(null)

const STORAGE_KEY = "app_language"

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || "en")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(
    (key, params = {}) => {
      const table = messages[lang] ?? messages.en
      let text = table[key] ?? messages.en[key] ?? key
      for (const [name, value] of Object.entries(params)) {
        text = text.split(`{${name}}`).join(String(value))
      }
      return text
    },
    [lang],
  )

  const toggleLang = useCallback(() => setLang((current) => (current === "en" ? "km" : "en")), [])

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/* eslint-disable react-refresh/only-export-components */
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}