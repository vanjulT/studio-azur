import { useEffect, useState } from "react"
import AdminHeader from "@/components/AdminHeader"
import Notice from "@/components/Notice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/context/LanguageContext"
import { api } from "@/lib/api"
import { formatDuration, formatPrice } from "@/lib/format"
import { servicePhoto } from "@/lib/images"

const emptyForm = { name: "", description: "", durationMinutes: "30", price: "", isActive: true }

function AdminServicesPage() {
  const { t } = useLanguage()

  const [services, setServices] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState("")
  const [busyId, setBusyId] = useState("")

  async function load() {
    try {
      const data = await api("/services/all?limit=50")
      setServices(data.services)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function startEdit(service) {
    setEditingId(service._id)
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: String(service.durationMinutes),
      price: String(service.price),
      isActive: service.isActive,
    })
    setMessage("")
    setError("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function resetForm() {
    setEditingId("")
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    // the inputs give text, the API wants numbers
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      isActive: form.isActive,
    }

    try {
      if (editingId) {
        await api(`/services/${editingId}`, { method: "PATCH", body })
        setMessage(t("adminSvc.saved"))
      } else {
        await api("/services", { method: "POST", body })
        setMessage(t("adminSvc.created"))
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(service) {
    setBusyId(service._id)
    setError("")
    try {
      await api(`/services/${service._id}`, { method: "PATCH", body: { isActive: !service.isActive } })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId("")
    }
  }

  async function handleDelete(id) {
    setBusyId(id)
    setError("")
    setMessage("")
    try {
      await api(`/services/${id}`, { method: "DELETE" })
      setMessage(t("adminSvc.deleted"))
      if (editingId === id) resetForm()
      await load()
    } catch (err) {
      // e.g. 409: this service has appointments -> hide it instead
      setError(err.message)
    } finally {
      setBusyId("")
      setConfirmDeleteId("")
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title={t("adminSvc.title")} subtitle={t("adminSvc.subtitle")} />

      <Notice type="success">{message}</Notice>
      <Notice>{error}</Notice>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sand-200 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-2xl text-sea-900">{editingId ? t("adminSvc.edit") : t("adminSvc.new")}</h2>

          <div className="space-y-1.5">
            <Label htmlFor="svc-name">{t("adminSvc.name")}</Label>
            <Input
              id="svc-name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              minLength={2}
              maxLength={60}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">{t("adminSvc.description")}</Label>
            <Textarea
              id="svc-desc"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-duration">{t("adminSvc.duration")}</Label>
              <Input
                id="svc-duration"
                type="number"
                min={15}
                max={240}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => updateField("durationMinutes", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">{t("adminSvc.price")}</Label>
              <Input
                id="svc-price"
                type="number"
                min={0}
                step={0.5}
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="h-4 w-4 accent-sea-700"
            />
            {t("adminSvc.active")}
          </label>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? t("admin.saving") : t("admin.save")}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                {t("admin.cancel")}
              </Button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((n) => <div key={n} className="h-24 animate-pulse rounded-2xl bg-sand-100" />)
          ) : services.length === 0 ? (
            <p className="rounded-2xl bg-sand-100 p-8 text-center text-ink/70">{t("adminSvc.empty")}</p>
          ) : (
            services.map((service) => (
              <div
                key={service._id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-3 pr-4 ${
                  editingId === service._id ? "border-sea-500 ring-2 ring-sea-100" : "border-sand-200"
                } ${service.isActive ? "" : "opacity-60"}`}
              >
                <img
                  src={servicePhoto(service.name, 200)}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sea-900">
                    {service.name}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        service.isActive ? "bg-emerald-50 text-emerald-700" : "bg-sand-200 text-ink/60"
                      }`}
                    >
                      {service.isActive ? t("adminSvc.visible") : t("adminSvc.hidden")}
                    </span>
                  </p>
                  <p className="text-sm text-ink/60">
                    {formatDuration(service.durationMinutes)} · {formatPrice(service.price)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {confirmDeleteId === service._id ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === service._id}
                        onClick={() => handleDelete(service._id)}
                      >
                        {t("admin.confirmDelete")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId("")}>
                        {t("admin.cancel")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(service)}>
                        {t("adminSvc.editBtn")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === service._id}
                        onClick={() => toggleActive(service)}
                      >
                        {service.isActive ? t("adminSvc.hide") : t("adminSvc.show")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(service._id)}>
                        {t("admin.delete")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminServicesPage
