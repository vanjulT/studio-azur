const Slot = require("../models/Slot");
const AppError = require("../utils/AppError");

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function findSlots(req, res, onlyFree) {
  const filter = {};

  if (req.query.date) {
    filter.date = req.query.date;
  } else {
    filter.date = { $gte: todayString() };
  }

  if (onlyFree) filter.isBooked = false;

  const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 });
  res.status(200).json({ slots });
}

async function getFreeSlots(req, res) {
  await findSlots(req, res, true);
}

async function getAllSlots(req, res) {
  await findSlots(req, res, false);
}

async function createSlots(req, res) {
  const { date, times } = req.body;

  if (date < todayString()) {
    throw new AppError("Cannot create slots in the past", 400);
  }

  let created = 0;
  for (const startTime of times) {
    const result = await Slot.updateOne(
      { date, startTime },
      { $setOnInsert: { isBooked: false } },
      { upsert: true }
    );
    created += result.upsertedCount;
  }

  const slots = await Slot.find({ date }).sort({ startTime: 1 });
  res.status(201).json({ created, slots });
}

async function deleteSlot(req, res) {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new AppError("Slot not found", 404);

  if (slot.isBooked) {
    throw new AppError("This slot is booked. Cancel the appointment first.", 409);
  }

  await slot.deleteOne();
  res.status(204).end();
}

module.exports = { getFreeSlots, getAllSlots, createSlots, deleteSlot };