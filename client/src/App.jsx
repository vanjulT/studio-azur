import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App