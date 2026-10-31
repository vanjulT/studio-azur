import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

function LoginPage() {
  const { login, isLoggedIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (isLoggedIn) {
    return <Navigate to={isAdmin ? "/admin/appointments" : "/"} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await login(email, password)
      const from = location.state?.from?.pathname
      if (user.role === "admin") navigate("/admin/appointments", { replace: true })
      else navigate(from || "/", { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(demoEmail, demoPassword) {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <AuthShell title={t("login.title")} subtitle={t("login.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-terra-100 px-3 py-2 text-sm text-terra-700">
            {error}
          </p>
        )}

        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/70">
        {t("login.newHere")}{" "}
        <Link to="/register" className="font-medium text-terra-600 hover:underline">
          {t("login.create")}
        </Link>
      </p>

      <div className="mt-8 rounded-2xl bg-sand-100 p-4 text-sm">
        <p className="font-medium text-ink">{t("login.demoTitle")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("user@studioazur.fr", "User1234!")}>
            {t("login.demoUser")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("admin@studioazur.fr", "Admin1234!")}>
            {t("login.demoAdmin")}
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink/60">
          user@studioazur.fr / User1234! · admin@studioazur.fr / Admin1234!
        </p>
      </div>
    </AuthShell>
  )
}

export default LoginPage
