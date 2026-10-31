import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

function ProtectedRoute({ adminOnly = false }) {
  const { isLoggedIn, isAdmin, checking } = useAuth()
  const location = useLocation()
  const { t } = useLanguage()

  if (checking) {
    return <p className="p-10 text-center text-muted-foreground">{t("common.loading")}</p>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute