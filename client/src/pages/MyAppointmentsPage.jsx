import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/context/LanguageContext"
import { api } from "@/lib/api"
import { formatDate, formatPrice, statusStyles } from "@/lib/format"

function AppointmentRow({ appointment, onCancel, cancellingId, confirmingId, setConfirmingId }) {
  const { service, slot, status } = appointment
  const isConfirming = confirmingId === appointment._id
  const isCancelling = cancellingId === appointment._id
  const { t, lang, serviceText } = useLanguage()

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-sea-900">{service ? serviceText(service).name : t("mine.serviceRemoved")}</p>
          <p className="text-sm text-ink/70">
            {slot ? `${formatDate(slot.date, lang)} ${t("book.at")} ${slot.startTime}` : t("mine.slotRemoved")}
            {service && ` · ${formatPrice(service.price)}`}
          </p>
          {appointment.notes && <p className="mt-1 text-xs text-ink/60">“{appointment.notes}”</p>}
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}>
            {t(`status.${status}`)}
          </span>

          {onCancel && !isConfirming && (
            <Button variant="outline" size="sm" onClick={() => setConfirmingId(appointment._id)}>
              {t("mine.cancel")}
            </Button>
          )}

          {onCancel && isConfirming && (
            <>
              <Button
                variant="destructive"
                size="sm"
                disabled={isCancelling}
                onClick={() => onCancel(appointment._id)}
              >
                {isCancelling ? t("mine.cancelling") : t("mine.confirmCancel")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingId("")}>
                {t("mine.keep")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MyAppointmentsPage() {
  const location = useLocation()
  const { t } = useLanguage()
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState(location.state?.message || "")
  const [confirmingId, setConfirmingId] = useState("")
  const [cancellingId, setCancellingId] = useState("")

  async function load() {
    try {
      const data = await api("/appointments/mine")
      setUpcoming(data.upcoming)
      setPast(data.past)
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(id) {
    setCancellingId(id)
    setMessage("")
    try {
      await api(`/appointments/${id}/cancel`, { method: "PATCH" })
      setMessage(t("mine.cancelled"))
      setConfirmingId("")
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setCancellingId("")
    }
  }

  if (loading) return <p className="text-center text-ink/70">{t("mine.loading")}</p>

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="wave-underline inline-block text-4xl text-sea-900">{t("mine.title")}</h1>
        <Link to="/" className="text-sm font-medium text-terra-600 hover:underline">{t("mine.bookAnother")}</Link>
      </div>

      {message && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-terra-100 px-4 py-3 text-sm text-terra-700">{error}</p>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl text-sea-800">{t("mine.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <p className="text-ink/70">
            {t("mine.noUpcoming")} <Link to="/" className="text-terra-600 hover:underline">{t("mine.findService")}</Link>
          </p>
        ) : (
          upcoming.map((a) => (
            <AppointmentRow
              key={a._id}
              appointment={a}
              onCancel={handleCancel}
              cancellingId={cancellingId}
              confirmingId={confirmingId}
              setConfirmingId={setConfirmingId}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl text-sea-800">{t("mine.past")}</h2>
        {past.length === 0 ? (
          <p className="text-ink/70">{t("mine.noPast")}</p>
        ) : (
          past.map((a) => <AppointmentRow key={a._id} appointment={a} />)
        )}
      </section>
    </div>
  )
}

export default MyAppointmentsPage