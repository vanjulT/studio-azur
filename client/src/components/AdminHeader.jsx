function AdminHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="wave-underline inline-block text-4xl text-sea-900">{title}</h1>
        <p className="mt-2 text-ink/70">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

export default AdminHeader
