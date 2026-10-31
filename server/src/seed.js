require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Service = require("./models/Service");
const Slot = require("./models/Slot");

const testUsers = [
  { name: "Studio Admin", email: "admin@studioazur.fr", password: "Admin1234!", role: "admin" },
  { name: "Claire Martin", email: "user@studioazur.fr", password: "User1234!", role: "user" },
];

const services = [
  { name: "Women's Haircut", description: "Wash, cut and blow-dry.", durationMinutes: 60, price: 45 },
  { name: "Men's Haircut", description: "Classic cut and styling.", durationMinutes: 30, price: 25 },
  { name: "Colour", description: "Full colour with care treatment.", durationMinutes: 90, price: 70 },
  { name: "Blow-dry", description: "Wash and blow-dry styling.", durationMinutes: 45, price: 30 },
  { name: "Beard Trim", description: "Shape and trim with hot towel.", durationMinutes: 15, price: 15 },
];

const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected, seeding...");

  for (const u of testUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.updateOne(
      { email: u.email },
      { $set: { name: u.name, role: u.role, password: hashed } },
      { upsert: true }
    );
  }
  console.log("Test users ready");

  for (const s of services) {
    await Service.updateOne({ name: s.name }, { $setOnInsert: s }, { upsert: true });
  }
  console.log("Services ready");

  let created = 0;
  for (let i = 1; i <= 14; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    if (day.getDay() === 0) continue;

    for (const startTime of times) {
      const result = await Slot.updateOne(
        { date: toDateString(day), startTime },
        { $setOnInsert: { isBooked: false } },
        { upsert: true }
      );
      created += result.upsertedCount;
    }
  }
  console.log(`Slots ready (${created} new)`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});