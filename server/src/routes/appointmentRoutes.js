const express = require("express");
const validate = require("../middleware/validate");
const { protect, requireAdmin } = require("../middleware/auth");
const {
  createAppointmentSchema,
  updateStatusSchema,
} = require("../validators/appointmentSchemas");
const {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

router.use(protect);

router.post("/", validate(createAppointmentSchema), createAppointment);
router.get("/mine", getMyAppointments);
router.patch("/:id/cancel", cancelAppointment);

router.get("/", requireAdmin, getAllAppointments);
router.patch("/:id/status", requireAdmin, validate(updateStatusSchema), updateAppointmentStatus);

module.exports = router;