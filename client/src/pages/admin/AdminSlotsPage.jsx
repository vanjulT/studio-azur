import { useCallback, useEffect, useState } from "react"
import AdminHeader from "@/components/AdminHeader"
import Notice from "@/components/Notice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/context/LanguageContext"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/format"

const PRESET_TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function AdminSlotsPage() {
  const { t, lang } = useLanguage()

  const today = toDateString(new Date())
  const tomorrow = toDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))

  const [date, setDate] = useState(tomorrow)
  const [slots, setSlots] = useState([])
  const [selected, setSelected] = useState([])
  const [customTime, setCustomTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [busyId, setBusyId] = useState("")

  const load = useCallback(async () => {
    if (!date) return
    setLoading(true)
    setError("")
    try {
      const data = await api(`/slots/all?date=${date}`)
      setSlots(data.slots)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    load()
    setSelected([])
    setMessage("")
  }, [load])

  const existingTimes = slots.map((s) => s.startTime)

  function toggleTime(time) {
    setSelected((current) =>
      current.includes(time) ? current.filter((x) => x !== time) : [...current, time].sort()
    )
  }

  function addCustomTime() {
    if (customTime && !selected.includes(customTime) && !existingTimes.includes(customTime)) {
      setSelected((current) => [...current, customTime].sort())
    }
    setCustomTime("")
  }

  async function handleAdd() {
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const data = await api("/slots", { method: "POST", body: { date, times: selected } })
      setMessage(t("adminSlots.added", { count: data.created }))
      setSlots(data.slots)
      setSelected([])
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    setBusyId(id)
    setError("")
    setMessage("")
    try {
      await api(`/slots/${id}`, { method: "DELETE" })
      setMessage(t("adminSlots.removed"))
      await load()
    } catch (err) {
      // e.g. 409: the slot is booked, cancel the appointment first
      setError(err.message)
    } finally {
      setBusyId("")
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title={t("adminSlots.title")} subtitle={t("adminSlots.subtitle")}>
        <div className="space-y-1">
          <Label htmlFor="slot-date">{t("adminSlots.day")}</Label>
          <Input
            id="slot-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-48 bg-white"
          />
        </div>
      </AdminHeader>

      <Notice type="success">{message}</Notice>
      <Notice>{error}</Notice>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Existing slots */}
        <section className="space-y-4 rounded-2xl border border-sand-200 bg-white p-5">
          <h2 className="text-2xl text-sea-900">
            {t("adminSlots.existing")}
            {date && <span className="block text-base font-normal text-ink/60">{formatDate(date, lang)}</span>}
          </h2>

          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-14 animate-pulse rounded-xl bg-sand-100" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="rounded-xl bg-sand-100 p-6 text-center text-ink/70">{t("adminSlots.none")}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <li
                  key={slot._id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    slot.isBooked ? "border-terra-100 bg-terra-100/60" : "border-sand-200 bg-sand-50"
                  }`}
                >
                  <span>
                    <span className="block font-semibold text-sea-900">{slot.startTime}</span>
                    <span className={`text-xs ${slot.isBooked ? "text-terra-700" : "text-emerald-700"}`}>
                      {slot.isBooked ? t("adminSlots.booked") : t("adminSlots.free")}
                    </span>
                  </span>
                  {!slot.isBooked && (
                    <button
                      type="button"
                      onClick={() => handleRemove(slot._id)}
                      disabled={busyId === slot._id}
                      className="rounded-full px-2 py-1 text-xs text-ink/50 hover:bg-white hover:text-terra-700 disabled:opacity-50"
                      aria-label={`${t("adminSlots.remove")} ${slot.startTime}`}
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add new times */}
        <section className="space-y-4 rounded-2xl border border-sand-200 bg-white p-5">
          <h2 className="text-2xl text-sea-900">{t("adminSlots.add")}</h2>
          <p className="text-sm text-ink/70">{t("adminSlots.quick")}</p>

          <div className="grid grid-cols-4 gap-2">
            {PRESET_TIMES.map((time) => {
              const exists = existingTimes.includes(time)
              const isSelected = selected.includes(time)
              return (
                <button
                  key={time}
                  type="button"
                  disabled={exists}
                  onClick={() => toggleTime(time)}
                  aria-pressed={isSelected}
                  className={`rounded-xl border px-2 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-35 ${
                    isSelected
                      ? "border-sea-700 bg-sea-700 text-white"
                      : "border-sand-200 bg-white hover:border-sea-300 hover:bg-sea-50"
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="custom-time">{t("adminSlots.custom")}</Label>
              <Input
                id="custom-time"
                type="time"
                step={900}
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={addCustomTime} disabled={!customTime}>
              +
            </Button>
          </div>

          {selected.length > 0 && (
            <p className="text-sm text-ink/70">{selected.join(" · ")}</p>
          )}

          <Button
            className="w-full bg-terra-500 hover:bg-terra-600"
            disabled={selected.length === 0 || saving || !date}
            onClick={handleAdd}
          >
            {saving ? t("admin.saving") : t("adminSlots.addSelected", { count: selected.length })}
          </Button>
        </section>
      </div>
    </div>
  )
}

export default AdminSlotsPage
