// Small coloured message box: type "error" (terracotta) or "success" (green)
function Notice({ type = "error", children }) {
  if (!children) return null
  const styles = type === "error" ? "bg-terra-100 text-terra-700" : "bg-emerald-50 text-emerald-800"
  return (
    <p role={type === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${styles}`}>
      {children}
    </p>
  )
}

export default Notice
