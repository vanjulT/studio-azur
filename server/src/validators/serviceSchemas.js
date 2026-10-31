const { z } = require("zod");

const createServiceSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  description: z.string().trim().max(300, "Description must be at most 300 characters").optional(),
  durationMinutes: z
    .number({ error: "Duration must be a number" })
    .int("Duration must be a whole number")
    .min(15, "Duration must be at least 15 minutes")
    .max(240, "Duration must be at most 240 minutes"),
  price: z.number({ error: "Price must be a number" }).min(0, "Price cannot be negative"),
  isActive: z.boolean().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

module.exports = { createServiceSchema, updateServiceSchema };