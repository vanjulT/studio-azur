import { createContext, useContext, useEffect, useState } from "react"
import { serviceNamesFr, translations } from "@/lib/translations"

const LanguageContext = createContext(null)
const STORAGE_KEY = "studio-azur-lang"

function startLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "en" || saved === "fr") return saved
  } catch {
    // storage blocked: fall back below
  }
  return navigator.language?.startsWith("fr") ? "fr" : "en"
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(startLanguage)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  // t("nav.hi", { name: "Claire" }) -> "Hi, Claire 👋"
  function t(key, values = {}) {
    let text = translations[lang][key] ?? translations.en[key] ?? key
    for (const [name, value] of Object.entries(values)) {
      text = text.replace(`{${name}}`, value)
    }
    return text
  }

  // Service name/description in the chosen language (falls back to the database text)
  function serviceText(service) {
    const fr = lang === "fr" ? serviceNamesFr[service.name] : null
    return {
      name: fr?.name ?? service.name,
      description: fr?.description ?? service.description,
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, serviceText }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
