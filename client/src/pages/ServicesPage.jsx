import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"
import { api } from "@/lib/api"
import { formatDuration, formatPrice } from "@/lib/format"
import { heroPhoto, photo, servicePhoto } from "@/lib/images"

const perks = [
  { icon: "✂️", title: "home.perk1Title", text: "home.perk1Text" },
  { icon: "🗓️", title: "home.perk2Title", text: "home.perk2Text" },
  { icon: "🌊", title: "home.perk3Title", text: "home.perk3Text" },
]

function ServicesPage() {
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const { t, serviceText } = useLanguage()

  const [services, setServices] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    // wait 300 ms after the last key press before calling the API (debounce)
    const timer = setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        const query = search ? `?search=${encodeURIComponent(search)}&limit=50` : "?limit=50"
        const data = await api(`/services${query}`)
        if (!ignore) setServices(data.services)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }, 300)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [search])

  function handleBook(serviceId) {
    const target = `/book/${serviceId}`
    if (isLoggedIn) navigate(target)
    else navigate("/login", { state: { from: { pathname: target } } })
  }

  return (
    <div className="space-y-14">
      {/* Hero with photo background */}
      <section
        className="photo-fade relative -mx-4 overflow-hidden px-6 py-20 text-white sm:mx-0 sm:rounded-3xl sm:px-12 sm:py-28"
        style={{ "--photo": `url(${photo(heroPhoto, 1800)})` }}
      >
        <div className="max-w-xl">
          <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
            {t("home.badge")}
          </p>
          <h1 className="text-4xl leading-tight sm:text-6xl">
            {isLoggedIn ? t("home.titleUser", { name: user.name.split(" ")[0] }) : t("home.title")}
          </h1>
          <p className="mt-4 text-lg text-white/90">
            {t("home.text")}
          </p>
          <Button
            size="lg"
            className="mt-8 h-11 bg-terra-500 px-6 text-base hover:bg-terra-600"
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("home.cta")}
          </Button>
        </div>
      </section>

      {/* Perks */}
      <section className="grid gap-4 sm:grid-cols-3">
        {perks.map((perk) => (
          <div key={perk.title} className="rounded-2xl border border-sand-200 bg-white/80 p-5">
            <p className="text-2xl" aria-hidden="true">{perk.icon}</p>
            <p className="mt-2 font-semibold text-mist-800">{t(perk.title)}</p>
            <p className="text-sm text-ink/70">{t(perk.text)}</p>
          </div>
        ))}
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-24 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="wave-underline inline-block text-3xl text-mist-900">{t("home.servicesTitle")}</h2>
            <p className="mt-2 text-ink/70">{t("home.servicesText")}</p>
          </div>
          <Input
            type="search"
            placeholder={t("home.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search services"
            className="h-10 w-full bg-white sm:w-64"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-terra-100 px-4 py-3 text-sm text-terra-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 animate-pulse rounded-2xl bg-sand-100" />
            ))}
          </div>
        ) : services.length === 0 && !error ? (
          <p className="rounded-2xl bg-sand-100 p-8 text-center text-ink/70">{t("home.noMatch", { search })}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const text = serviceText(service)
              return (
              <article
                key={service._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[0_12px_32px_-20px_rgb(43_33_28/0.35)] transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-sand-100">
                  <img
                    src={servicePhoto(service.name)}
                    alt={text.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl text-mist-900">{text.name}</h3>
                    <span className="shrink-0 rounded-full bg-terra-100 px-2.5 py-0.5 text-sm font-semibold text-terra-700">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  <p className="mt-1 flex-1 text-sm text-ink/70">{text.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-ink/60">⏱ {formatDuration(service.durationMinutes)}</span>
                    <Button onClick={() => handleBook(service._id)}>{t("home.book")}</Button>
                  </div>
                </div>
              </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ServicesPage
