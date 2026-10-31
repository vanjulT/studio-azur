import { Outlet, useLocation } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { useLanguage } from "@/context/LanguageContext"

function Layout() {
  const location = useLocation()
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main key={location.pathname} className="fade-up mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8">
        <Outlet />
      </main>
      <footer className="border-t border-sand-200 bg-sand-100/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-ink/70">
          <p>
            <span className="font-display font-semibold text-sea-800">Studio Azur</span> · 12 Rue de France, 06000 Nice
          </p>
          <p>{t("footer.hours")}</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
