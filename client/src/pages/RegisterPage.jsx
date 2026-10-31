import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

function RegisterPage() {
  const { register, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (isLoggedIn) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError(t("register.passwordShort"))
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      navigate("/", { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title={t("register.title")} subtitle={t("register.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("auth.name")}</Label>
          <Input
            id="name"
            autoComplete="name"
            className="h-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>
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
            autoComplete="new-password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-ink/60">{t("register.passwordHint")}</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-terra-100 px-3 py-2 text-sm text-terra-700">
            {error}
          </p>
        )}

        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? t("register.submitting") : t("register.submit")}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/70">
        {t("register.haveAccount")}{" "}
        <Link to="/login" className="font-medium text-terra-600 hover:underline">
          {t("login.submit")}
        </Link>
      </p>
    </AuthShell>
  )
}

export default RegisterPage
