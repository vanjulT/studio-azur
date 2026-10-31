const express = require("express");
const validate = require("../middleware/validate");
const { protect, requireAdmin } = require("../middleware/auth");
const { createServiceSchema, updateServiceSchema } = require("../validators/serviceSchemas");
const {
  getPublicServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getPublicServices);
router.get("/all", protect, requireAdmin, getAllServices);
router.get("/:id", getServiceById);

router.post("/", protect, requireAdmin, validate(createServiceSchema), createService);
router.patch("/:id", protect, requireAdmin, validate(updateServiceSchema), updateService);
router.delete("/:id", protect, requireAdmin, deleteService);

module.exports = router;