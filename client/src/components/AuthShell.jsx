import { useLanguage } from "@/context/LanguageContext"
import { authPhoto, photo } from "@/lib/images"

// Split screen for login and register: a photo on the left, the form on the right
function AuthShell({ title, subtitle, children }) {
  const { t } = useLanguage()

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-[0_24px_60px_-30px_rgb(43_33_28/0.45)] md:grid-cols-2">
      <div
        className="photo-fade relative hidden min-h-[34rem] md:block"
        style={{ "--photo": `url(${photo(authPhoto, 1000)})` }}
      >
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <p className="font-display text-3xl leading-tight">{t("auth.photoTitle")}</p>
          <p className="mt-2 text-white/85">{t("auth.photoText")}</p>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <h1 className="text-3xl text-sea-900">{title}</h1>
        <p className="mt-1.5 text-ink/70">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export default AuthShell
