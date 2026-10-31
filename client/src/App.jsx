import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import AdminAppointmentsPage from "@/pages/admin/AdminAppointmentsPage"
import AdminServicesPage from "@/pages/admin/AdminServicesPage"
import AdminSlotsPage from "@/pages/admin/AdminSlotsPage"
import BookPage from "@/pages/BookPage"
import LoginPage from "@/pages/LoginPage"
import MyAppointmentsPage from "@/pages/MyAppointmentsPage"
import RegisterPage from "@/pages/RegisterPage"
import ServicesPage from "@/pages/ServicesPage"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<ServicesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/book/:serviceId" element={<BookPage />} />
          <Route path="/my-appointments" element={<MyAppointmentsPage />} />
        </Route>

        {/* Admins only */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<Navigate to="/admin/appointments" replace />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/slots" element={<AdminSlotsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
