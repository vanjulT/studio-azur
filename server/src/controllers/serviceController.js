const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const AppError = require("../utils/AppError");
const { getPagination, escapeRegex } = require("../utils/pagination");

async function listServices(req, res, onlyActive) {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (onlyActive) filter.isActive = true;
  if (req.query.search) {
    filter.name = { $regex: escapeRegex(req.query.search), $options: "i" };
  }

  const [services, total] = await Promise.all([
    Service.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Service.countDocuments(filter),
  ]);

  res.status(200).json({
    services,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function getPublicServices(req, res) {
  await listServices(req, res, true);
}

async function getAllServices(req, res) {
  await listServices(req, res, false);
}

async function getServiceById(req, res) {
  const service = await Service.findById(req.params.id);
  if (!service) throw new AppError("Service not found", 404);
  res.status(200).json({ service });
}

async function createService(req, res) {
  const service = await Service.create(req.body);
  res.status(201).json({ service });
}

async function updateService(req, res) {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new AppError("Service not found", 404);
  res.status(200).json({ service });
}

async function deleteService(req, res) {
  const used = await Appointment.exists({ service: req.params.id });
  if (used) {
    throw new AppError("This service has appointments. Deactivate it instead of deleting.", 409);
  }

  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new AppError("Service not found", 404);
  res.status(204).end();
}

module.exports = {
  getPublicServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};