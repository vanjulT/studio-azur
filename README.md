# Studio Azur · Appointment Booking

A full-stack MERN app for a hair salon in Nice. Customers browse services, pick a free time and book. The salon admin manages services, opening slots and every appointment.

**Milestone 4, Option A (Appointment Booking System)**, WSCube Tech Full Stack Mentorship, batch May 2026.

| | Link |
|---|---|
| 🌐 Live app (frontend, Vercel) | https://studio-azur.vercel.app |
| ⚙️ Live API (backend, Render) | https://studio-azur.onrender.com/api/health |
| 📮 Postman collection | [`postman/studio-azur.postman_collection.json`](postman/studio-azur.postman_collection.json) |

> The API runs on Render's free plan and falls asleep after 15 minutes without visits. The first request can take about 50 seconds, then it is fast.

## Test accounts

| Role | Email | Password |
|---|---|---|
| Customer (user) | `user@studioazur.fr` | `User1234!` |
| Admin | `admin@studioazur.fr` | `Admin1234!` |

The login page has **Customer demo** and **Admin demo** buttons that fill these in.

## Features

**Customer**
- Register, log in, log out (JWT)
- Browse services with search
- Book: choose a day, then a free time (no double booking)
- My appointments: upcoming and past, cancel an upcoming one

**Admin**
- Create, edit, hide and delete services
- Add or remove time slots for any day
- See all appointments with pagination, filters (status, date) and customer search
- Mark appointments as completed or no-show

**Both**
- Role-aware interface (the menu changes with the role)
- Loading, empty and error states; API error messages are shown to the user
- English / French switch

## Tech stack

| Part | Tools |
|---|---|
| Frontend | React 19, Vite, React Router 7, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js, Express 5, Mongoose 9, Zod 4 |
| Database | MongoDB Atlas (free M0 cluster) |
| Security | bcryptjs (password hashing), jsonwebtoken (JWT), express-rate-limit, CORS |
| Hosting | Vercel (frontend), Render (backend) |

## Database schema

Four collections. `Appointment` links the three others with `ref`, and the API uses `populate()` to return the full service, slot and customer.

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : books
    SERVICE ||--o{ APPOINTMENT : "is booked as"
    SLOT ||--o| APPOINTMENT : "is taken by"

    USER {
        ObjectId _id
        string name
        string email "unique, lowercase"
        string password "bcrypt hash, select false"
        string role "user | admin"
        date createdAt
        date updatedAt
    }
    SERVICE {
        ObjectId _id
        string name "unique"
        string description
        number durationMinutes "15 to 240"
        number price "euros, >= 0"
        boolean isActive
        date createdAt
        date updatedAt
    }
    SLOT {
        ObjectId _id
        string date "YYYY-MM-DD"
        string startTime "HH:MM"
        boolean isBooked
        date createdAt
        date updatedAt
    }
    APPOINTMENT {
        ObjectId _id
        ObjectId user "ref User"
        ObjectId service "ref Service"
        ObjectId slot "ref Slot"
        string status "booked | cancelled | completed | no-show"
        string notes
        date createdAt
        date updatedAt
    }
```

- `Slot` has a unique index on `{ date, startTime }`, so the same time cannot exist twice on one day.
- Dates are stored as `"YYYY-MM-DD"` text to avoid timezone bugs, and this format sorts in date order.

## How double booking is prevented

Booking uses one **atomic** MongoDB operation:

```js
Slot.findOneAndUpdate({ _id: slotId, isBooked: false }, { isBooked: true }, { new: true })
```

It finds the slot **only if it is still free** and marks it booked in a single step. If two people book the last slot at the same moment, MongoDB handles them one after the other: the first one wins, and the second one finds nothing and gets **409 Conflict**. Cancelling sets `isBooked` back to `false`.

## API endpoints

Base URL: `https://studio-azur.onrender.com/api` (local: `http://localhost:5001/api`).
Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Server check |
| POST | `/auth/register` | Public · rate limited | Create an account (role is always `user`) |
| POST | `/auth/login` | Public · rate limited | Log in, returns a JWT |
| GET | `/auth/me` | User | The logged-in user |
| GET | `/services?page=&limit=&search=` | Public | Active services, paginated, searchable |
| GET | `/services/all?page=&limit=&search=` | Admin | All services, including hidden ones |
| GET | `/services/:id` | Public | One service |
| POST | `/services` | Admin | Create a service |
| PATCH | `/services/:id` | Admin | Update a service (any fields) |
| DELETE | `/services/:id` | Admin | Delete (409 if it has appointments) |
| GET | `/slots?date=` | Public | Free slots (from today, or one day) |
| GET | `/slots/all?date=` | Admin | Free and booked slots |
| POST | `/slots` | Admin | Add times to a day: `{ date, times: [] }` |
| DELETE | `/slots/:id` | Admin | Remove a free slot (409 if booked) |
| POST | `/appointments` | User | Book: `{ serviceId, slotId, notes? }` (409 if taken) |
| GET | `/appointments/mine` | User | My appointments: `{ upcoming, past }` |
| PATCH | `/appointments/:id/cancel` | Owner or admin | Cancel, frees the slot |
| GET | `/appointments?page=&limit=&status=&date=&search=` | Admin | All appointments with filters |
| PATCH | `/appointments/:id/status` | Admin | `{ status: "completed" \| "no-show" }` |

### Status codes used

| Code | When |
|---|---|
| 200 / 201 / 204 | OK / created / deleted |
| 400 | Invalid data (Zod or Mongoose validation, bad id) |
| 401 | No token, invalid or expired token, wrong login |
| 403 | Logged in but not allowed (user on an admin route, cancelling someone else's booking) |
| 404 | Not found |
| 409 | Conflict: email already used, slot already booked, service still in use |
| 429 | Too many login / register attempts (10 per 15 minutes) |
| 500 | Server error (details only in the server log) |

## Security

- Passwords are hashed with **bcrypt** (10 salt rounds) and never returned (`select: false`).
- **JWT** holds only the user id and role, is signed with a secret from `.env`, and expires after 1 day.
- `protect` middleware → **401**; `requireAdmin` middleware → **403**. Hiding admin buttons in React is only for comfort: the real protection is on the server.
- **Zod** validates every request body; unknown fields (like `"role": "admin"` on register) are removed.
- **Rate limiting** on register and login.
- **CORS** only allows the frontend's own address (`CLIENT_URL`).
- All secrets live in `.env`, which is in `.gitignore`. See `server/.env.example`.
- One central **error handler** turns every error into a clean JSON message with the right status code.

## Project structure

```
studio-azur/
├── server/                 Express REST API
│   └── src/
│       ├── config/         db.js (MongoDB connection)
│       ├── models/         User, Service, Slot, Appointment
│       ├── controllers/    auth, service, slot, appointment logic
│       ├── routes/         URL → middleware → controller
│       ├── middleware/     auth (401/403), validate (Zod), errorHandler
│       ├── validators/     Zod schemas
│       ├── utils/          AppError, pagination helpers
│       ├── seed.js         test accounts, services and slots
│       ├── app.js          Express app (middleware + routes)
│       └── server.js       connects to MongoDB, then starts listening
├── client/                 React app (Vite)
│   └── src/
│       ├── components/     Navbar, Layout, ProtectedRoute, shadcn ui/
│       ├── context/        AuthContext, LanguageContext
│       ├── lib/            api.js (fetch helper), translations, format, images
│       └── pages/          customer pages + admin/
└── postman/                Postman collection (26 requests)
```

## Run it locally

You need Node.js 20+ and a MongoDB Atlas connection string.

```bash
git clone https://github.com/vanjulT/studio-azur.git
cd studio-azur

# Backend
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
node src/seed.js          # creates test accounts, services and slots
npm run dev               # http://localhost:5001

# Frontend (second terminal)
cd client
npm install
echo "VITE_API_URL=http://localhost:5001/api" > .env
npm run dev               # http://localhost:5173
```

Port 5001 is used because macOS uses port 5000 for AirPlay.

### Environment variables

| Where | Variable | Example |
|---|---|---|
| server | `PORT` | `5001` (Render sets its own) |
| server | `MONGODB_URI` | `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/studio-azur` |
| server | `JWT_SECRET` | a long random string |
| server | `JWT_EXPIRES_IN` | `1d` |
| server | `CLIENT_URL` | `http://localhost:5173` (on Render: `https://studio-azur.vercel.app`) |
| client | `VITE_API_URL` | `http://localhost:5001/api` |

## Postman

Import `postman/studio-azur.postman_collection.json`. Run **Auth → Login as user** and **Login as admin** first: they save the tokens automatically. Request names show the expected result, for example **Create service as user (403)** or **Book same slot again (409)**. To test the live API, change the collection variable `baseUrl` to `https://studio-azur.onrender.com/api`.

## Credits

Photos from [Unsplash](https://unsplash.com) (Unsplash License). Built by Vanjul Thakur, with help from an AI assistant (Claude) for guidance and parts of the code.
