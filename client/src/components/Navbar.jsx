import { Link, NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import LanguageSwitch from "@/components/LanguageSwitch"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

const userLinks = [
  { to: "/", label: "nav.services" },
  { to: "/my-appointments", label: "nav.myAppointments" },
]

const adminLinks = [
  { to: "/admin/appointments", label: "nav.appointments" },
  { to: "/admin/services", label: "nav.services" },
  { to: "/admin/slots", label: "nav.slots" },
]

function linkClass({ isActive }) {
  return isActive
    ? "rounded-full bg-mist-700 px-3.5 py-1.5 text-sm font-medium text-white"
    : "rounded-full px-3.5 py-1.5 text-sm text-ink/75 transition-colors hover:bg-sand-100 hover:text-ink"
}

function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#4b4642" />
      <path d="M14 40c6-6 12-6 18 0s12 6 18 0" fill="none" stroke="#f8efe2" strokeWidth="5" strokeLinecap="round" />
      <circle cx="44" cy="20" r="7" fill="#e08a63" />
    </svg>
  )
}

function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const links = isLoggedIn ? (isAdmin ? adminLinks : userLinks) : [{ to: "/", label: "nav.services" }]

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link to={isAdmin ? "/admin/appointments" : "/"} className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-xl font-semibold text-mist-800">Studio Azur</span>
          {isAdmin && (
            <span className="rounded-full bg-terra-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-terra-700">
              {t("nav.admin")}
            </span>
          )}
        </Link>

        <ul className="order-last flex w-full flex-wrap gap-1 sm:order-0 sm:w-auto">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.to === "/"} className={linkClass}>
                {t(link.label)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitch />
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm text-ink/70 sm:inline">{t("nav.hi", { name: user.name.split(" ")[0] })}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                {t("nav.login")}
              </NavLink>
              <Button size="sm" className="bg-terra-500 hover:bg-terra-600" onClick={() => navigate("/register")}>
                {t("nav.signup")}
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
