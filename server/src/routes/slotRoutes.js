const express = require("express");
const validate = require("../middleware/validate");
const { protect, requireAdmin } = require("../middleware/auth");
const { createSlotsSchema } = require("../validators/slotSchemas");
const {
  getFreeSlots,
  getAllSlots,
  createSlots,
  deleteSlot,
} = require("../controllers/slotController");

const router = express.Router();

router.get("/", getFreeSlots);
router.get("/all", protect, requireAdmin, getAllSlots);
router.post("/", protect, requireAdmin, validate(createSlotsSchema), createSlots);
router.delete("/:id", protect, requireAdmin, deleteSlot);

module.exports = router;