const { z } = require("zod");

const objectId = (label) =>
  z
    .string({ error: `${label} is required` })
    .regex(/^[a-f\d]{24}$/i, `${label} is not a valid id`);

const createAppointmentSchema = z.object({
  serviceId: objectId("Service id"),
  slotId: objectId("Slot id"),
  notes: z.string().trim().max(200, "Notes must be at most 200 characters").optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["completed", "no-show"], {
    error: "Status must be 'completed' or 'no-show'",
  }),
});

module.exports = { createAppointmentSchema, updateStatusSchema };