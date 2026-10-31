import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/context/LanguageContext"
import { api } from "@/lib/api"
import { formatDate, formatDuration, formatPrice } from "@/lib/format"
import { servicePhoto } from "@/lib/images"

function choiceClass(active) {
  return active
    ? "border-mist-700 bg-mist-700 text-white shadow-md"
    : "border-sand-200 bg-white text-ink hover:border-mist-300 hover:bg-mist-50"
}

function BookPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { t, lang, serviceText } = useLanguage()

  const [service, setService] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlotId, setSelectedSlotId] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const loadSlots = useCallback(async () => {
    const data = await api("/slots")
    setSlots(data.slots)
    return data.slots
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [serviceData, freeSlots] = await Promise.all([api(`/services/${serviceId}`), loadSlots()])
        setService(serviceData.service)
        if (freeSlots.length > 0) setSelectedDate(freeSlots[0].date)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [serviceId, loadSlots])

  // Group slots by day: { "2026-11-02": [slot, slot], ... }
  const slotsByDate = useMemo(() => {
    const groups = {}
    for (const slot of slots) {
      if (!groups[slot.date]) groups[slot.date] = []
      groups[slot.date].push(slot)
    }
    return groups
  }, [slots])

  const dates = Object.keys(slotsByDate)
  const timesForDay = slotsByDate[selectedDate] || []
  const selectedSlot = slots.find((s) => s._id === selectedSlotId)

  async function handleConfirm() {
    setError("")
    setSubmitting(true)
    try {
      await api("/appointments", {
        method: "POST",
        body: { serviceId, slotId: selectedSlotId, notes: notes.trim() || undefined },
      })
      navigate("/my-appointments", { state: { message: t("book.success") } })
    } catch (err) {
      // e.g. 409: someone else booked this slot a moment ago -> refresh the free times
      setError(err.message)
      setSelectedSlotId("")
      await loadSlots()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-3xl bg-sand-100" />
  }

  if (!service) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-terra-700">{error || t("book.notFound")}</p>
        <Link to="/" className="text-mist-700 hover:underline">{t("common.back")}</Link>
      </div>
    )
  }

  const text = serviceText(service)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/" className="text-sm font-medium text-mist-700 hover:underline">{t("common.back")}</Link>

      <div className="grid overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-[0_24px_60px_-30px_rgb(43_33_28/0.45)] md:grid-cols-[2fr_3fr]">
        {/* Summary with photo */}
        <aside className="flex min-w-0 flex-col">
          <img
            src={servicePhoto(service.name, 800)}
            alt={text.name}
            className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-64"
          />
          <div className="flex flex-1 flex-col gap-3 bg-sand-50 p-6">
            <h1 className="text-3xl text-mist-900">{text.name}</h1>
            <p className="text-sm text-ink/70">{text.description}</p>
            <div className="flex gap-2 text-sm">
              <span className="rounded-full bg-white px-3 py-1 text-ink/80">⏱ {formatDuration(service.durationMinutes)}</span>
              <span className="rounded-full bg-terra-100 px-3 py-1 font-semibold text-terra-700">{formatPrice(service.price)}</span>
            </div>
            {selectedSlot && (
              <div className="mt-auto rounded-2xl border border-mist-100 bg-mist-50 p-4 text-sm">
                <p className="text-ink/60">{t("book.yourChoice")}</p>
                <p className="font-semibold text-mist-800">
                  {formatDate(selectedSlot.date, lang)} {t("book.at")} {selectedSlot.startTime}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Steps */}
        <section className="min-w-0 space-y-7 p-6 sm:p-8">
          {dates.length === 0 ? (
            <p className="rounded-2xl bg-sand-100 p-6 text-ink/70">{t("book.noSlots")}</p>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-mist-900">{t("book.step1")}</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date) => {
                    const [weekday, day, month] = formatDate(date, lang).split(" ")
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date)
                          setSelectedSlotId("")
                        }}
                        className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2 transition-all ${choiceClass(date === selectedDate)}`}
                      >
                        <span className="text-xs uppercase opacity-80">{weekday.replace(/[,.]/g, "")}</span>
                        <span className="text-xl font-semibold">{day}</span>
                        <span className="text-xs opacity-80">{month.replace(/[,.]/g, "")}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-mist-900">{t("book.step2")}</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timesForDay.map((slot) => (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot._id)}
                      aria-pressed={slot._id === selectedSlotId}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${choiceClass(slot._id === selectedSlotId)}`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-semibold text-mist-900">
                  {t("book.step3")} <span className="font-normal text-ink/50">{t("book.optional")}</span>
                </Label>
                <Textarea
                  id="notes"
                  maxLength={200}
                  placeholder={t("book.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-terra-100 px-3 py-2 text-sm text-terra-700">
              {error}
            </p>
          )}

          <Button
            className="h-11 w-full bg-terra-500 text-base hover:bg-terra-600"
            disabled={!selectedSlotId || submitting}
            onClick={handleConfirm}
          >
            {submitting ? t("book.confirming") : t("book.confirm")}
          </Button>
        </section>
      </div>
    </div>
  )
}

export default BookPage
