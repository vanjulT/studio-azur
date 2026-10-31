// "2026-11-02" -> "Mon 2 Nov 2026" (en) or "lun. 2 nov. 2026" (fr)
export function formatDate(dateString, lang = "en") {
  const [y, m, d] = dateString.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// 45 -> "45 €"
export function formatPrice(price) {
  return `${price} €`
}

// 90 -> "1 h 30 min"
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

export const statusStyles = {
  booked: "bg-mist-100 text-mist-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-sand-200 text-ink/70",
  "no-show": "bg-terra-100 text-terra-700",
}