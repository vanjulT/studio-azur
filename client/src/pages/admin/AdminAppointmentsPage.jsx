import { useCallback, useEffect, useRef, useState } from "react"
import AdminHeader from "@/components/AdminHeader"
import Notice from "@/components/Notice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/context/LanguageContext"
import { api } from "@/lib/api"
import { formatDate, statusStyles } from "@/lib/format"

const STATUSES = ["booked", "completed", "cancelled", "no-show"]
const LIMIT = 8

function AdminAppointmentsPage() {
  const { t, lang, serviceText } = useLanguage()

  const [appointments, setAppointments] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [busyId, setBusyId] = useState("")

  const requestId = useRef(0)

  // wait until the admin stops typing before searching (and go back to page 1)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(async () => {
    // only the newest request may update the screen (no out-of-order answers)
    const myId = ++requestId.current
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (status) params.set("status", status)
      if (date) params.set("date", date)
      if (debouncedSearch) params.set("search", debouncedSearch)
      const data = await api(`/appointments?${params}`)
      if (myId !== requestId.current) return
      setAppointments(data.appointments)
      setPagination(data.pagination)
    } catch (err) {
      if (myId === requestId.current) setError(err.message)
    } finally {
      if (myId === requestId.current) setLoading(false)
    }
  }, [page, status, date, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(id, action) {
    setBusyId(id)
    setMessage("")
    setError("")
    try {
      if (action === "cancel") {
        await api(`/appointments/${id}/cancel`, { method: "PATCH" })
      } else {
        await api(`/appointments/${id}/status`, { method: "PATCH", body: { status: action } })
      }
      setMessage(t("adminAppt.updated"))
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId("")
    }
  }

  function clearFilters() {
    setStatus("")
    setDate("")
    setSearch("")
    setPage(1)
  }

  const hasFilters = status || date || search

  return (
    <div className="space-y-6">
      <AdminHeader title={t("adminAppt.title")} subtitle={t("adminAppt.subtitle")}>
        <span className="rounded-full bg-sea-100 px-3 py-1 text-sm font-medium text-sea-800">
          {t("adminAppt.total", { count: pagination.total })}
        </span>
      </AdminHeader>

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-sand-200 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          type="search"
          placeholder={t("adminAppt.search")}
          aria-label={t("adminAppt.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          aria-label={t("adminAppt.status")}
          className="h-10 rounded-lg border border-input bg-white px-3 text-sm"
        >
          <option value="">{t("adminAppt.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            setPage(1)
          }}
          aria-label={t("adminAppt.when")}
          className="h-10"
        />
        <Button variant="ghost" className="h-10" onClick={clearFilters} disabled={!hasFilters}>
          {t("adminAppt.clear")}
        </Button>
      </div>

      <Notice type="success">{message}</Notice>
      <Notice>{error}</Notice>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <div className="hidden grid-cols-[1.4fr_1.6fr_1.2fr_0.8fr_1.6fr] gap-3 border-b border-sand-200 bg-sand-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink/60 md:grid">
          <span>{t("adminAppt.when")}</span>
          <span>{t("adminAppt.customer")}</span>
          <span>{t("adminAppt.service")}</span>
          <span>{t("adminAppt.status")}</span>
          <span />
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 animate-pulse rounded-lg bg-sand-100" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="p-8 text-center text-ink/60">{t("adminAppt.empty")}</p>
        ) : (
          <ul className="divide-y divide-sand-100">
            {appointments.map((a) => (
              <li
                key={a._id}
                className="grid gap-2 px-5 py-4 md:grid-cols-[1.4fr_1.6fr_1.2fr_0.8fr_1.6fr] md:items-center md:gap-3"
              >
                <span className="font-medium text-sea-900">
                  {a.slot ? `${formatDate(a.slot.date, lang)} · ${a.slot.startTime}` : "—"}
                </span>
                <span className="text-sm">
                  <span className="block font-medium text-ink">{a.user?.name ?? "—"}</span>
                  <span className="text-ink/60">{a.user?.email}</span>
                </span>
                <span className="text-sm text-ink/80">{a.service ? serviceText(a.service).name : "—"}</span>
                <span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[a.status]}`}>
                    {t(`status.${a.status}`)}
                  </span>
                </span>
                <span className="flex flex-wrap gap-1.5 md:justify-end">
                  {a.status === "booked" && (
                    <>
                      <Button size="sm" disabled={busyId === a._id} onClick={() => changeStatus(a._id, "completed")}>
                        {t("adminAppt.completed")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === a._id}
                        onClick={() => changeStatus(a._id, "no-show")}
                      >
                        {t("adminAppt.noShow")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === a._id}
                        onClick={() => changeStatus(a._id, "cancel")}
                      >
                        {t("adminAppt.cancelBooking")}
                      </Button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            {t("admin.prev")}
          </Button>
          <span className="text-sm text-ink/70">
            {t("admin.page", { page: pagination.page, total: pagination.totalPages })}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("admin.next")}
          </Button>
        </div>
      )}
    </div>
  )
}

export default AdminAppointmentsPage
