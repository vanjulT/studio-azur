import { useLanguage } from "@/context/LanguageContext"

function LanguageSwitch() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex rounded-full border border-sand-200 bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Language / Langue">
      {["en", "fr"].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            lang === code ? "bg-mist-700 text-white" : "text-ink/60 hover:text-ink"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitch
