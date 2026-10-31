const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const Slot = require("../models/Slot");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { getPagination, escapeRegex } = require("../utils/pagination");

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const populateAll = [
  { path: "service", select: "name durationMinutes price" },
  { path: "slot", select: "date startTime" },
];

// USER: book an appointment
async function createAppointment(req, res) {
  const { serviceId, slotId, notes } = req.body;

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw new AppError("Service not found", 404);
  }

  // Atomic step: only ONE request can switch this slot from free to booked
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, isBooked: false, date: { $gte: todayString() } },
    { isBooked: true },
    { new: true }
  );

  if (!slot) {
    const exists = await Slot.exists({ _id: slotId });
    if (!exists) throw new AppError("Slot not found", 404);
    throw new AppError("Sorry, this slot was just booked by someone else", 409);
  }

  let appointment;
  try {
    appointment = await Appointment.create({
      user: req.user._id,
      service: service._id,
      slot: slot._id,
      notes,
    });
  } catch (error) {
    await Slot.updateOne({ _id: slot._id }, { isBooked: false });
    throw error;
  }

  await appointment.populate(populateAll);
  res.status(201).json({ appointment });
}

// USER: my appointments, split into upcoming and past
async function getMyAppointments(req, res) {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate(populateAll)
    .sort({ createdAt: -1 });

  const today = todayString();
  const upcoming = [];
  const past = [];

  for (const a of appointments) {
    const isFuture = a.slot && a.slot.date >= today;
    if (a.status === "booked" && isFuture) upcoming.push(a);
    else past.push(a);
  }

  upcoming.sort((a, b) =>
    (a.slot.date + a.slot.startTime).localeCompare(b.slot.date + b.slot.startTime)
  );

  res.status(200).json({ upcoming, past });
}

// USER (own) or ADMIN: cancel
async function cancelAppointment(req, res) {
  const appointment = await Appointment.findById(req.params.id).populate("slot");
  if (!appointment) throw new AppError("Appointment not found", 404);

  const isOwner = appointment.user.equals(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new AppError("You can only cancel your own appointments", 403);
  }

  if (appointment.status !== "booked") {
    throw new AppError(`Cannot cancel an appointment that is ${appointment.status}`, 400);
  }

  if (appointment.slot && appointment.slot.date < todayString()) {
    throw new AppError("Cannot cancel a past appointment", 400);
  }

  appointment.status = "cancelled";
  await appointment.save();

  if (appointment.slot) {
    await Slot.updateOne({ _id: appointment.slot._id }, { isBooked: false });
  }

  await appointment.populate(populateAll);
  res.status(200).json({ appointment });
}

// ADMIN: all appointments, paginated, with filters
async function getAllAppointments(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.date) {
    const slotIds = await Slot.find({ date: req.query.date }).distinct("_id");
    filter.slot = { $in: slotIds };
  }

  if (req.query.search) {
    const regex = { $regex: escapeRegex(req.query.search), $options: "i" };
    const userIds = await User.find({ $or: [{ name: regex }, { email: regex }] }).distinct("_id");
    filter.user = { $in: userIds };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate([...populateAll, { path: "user", select: "name email" }])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  res.status(200).json({
    appointments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// ADMIN: mark completed or no-show
async function updateAppointmentStatus(req, res) {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);

  if (appointment.status !== "booked") {
    throw new AppError(`Appointment is already ${appointment.status}`, 400);
  }

  appointment.status = req.body.status;
  await appointment.save();

  await appointment.populate([...populateAll, { path: "user", select: "name email" }]);
  res.status(200).json({ appointment });
}

module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};