const { z } = require("zod");

const dateRule = z
  .string({ error: "Date is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const timeRule = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format");

const createSlotsSchema = z.object({
  date: dateRule,
  times: z
    .array(timeRule, { error: "Times must be a list" })
    .min(1, "Add at least one time")
    .max(20, "At most 20 times per day"),
});

module.exports = { createSlotsSchema };