# ParkSmart Web

IoT-based smart parking web system for Manaoag, Pangasinan, Philippines. Features a public driver portal for finding and reserving parking, plus an admin/operator dashboard for real-time monitoring and management.

## Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.IO
- **Auth:** JWT + bcrypt
- **Maps:** Leaflet.js
- **Charts:** Chart.js / Recharts
- **QR:** qrcode npm package

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

## Project Structure

```
parksmart-web/
├── frontend/          # React.js + Vite client
├── backend/           # Node.js + Express server
├── .gitignore
└── README.md
```

## How to Run

### 1. Clone and navigate

```bash
cd parksmart-web
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and SMTP credentials
npm install
npm start
```

The backend server will start on `http://localhost:5000`.

### 3. Seed Data

```bash
cd backend
node seed/seed.js
```

This creates sample lots, slots, users, and reservations.

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start on `http://localhost:5173`.

## Environment Variables

### Backend (.env)

| Variable            | Description                          |
|---------------------|--------------------------------------|
| PORT                | Server port (default: 5000)          |
| MONGO_URI           | MongoDB connection string            |
| JWT_SECRET          | Secret for signing JWT tokens        |
| JWT_EXPIRES_IN      | Token expiry (e.g., 7d)              |
| SMTP_HOST           | SMTP server host                     |
| SMTP_PORT           | SMTP server port                     |
| SMTP_USER           | SMTP username/email                  |
| SMTP_PASS           | SMTP password/app password           |
| CLIENT_URL          | Frontend URL for CORS                |
| IOT_IP_WHITELIST    | Comma-separated ESP32 IP addresses   |

### Frontend (.env)

| Variable            | Description                          |
|---------------------|--------------------------------------|
| VITE_API_URL        | Backend API base URL                 |
| VITE_SOCKET_URL     | Socket.IO server URL                 |
| VITE_MAPS_API_KEY   | Google Maps API key (optional)       |

## IoT Integration Guide

### ESP32 Sensor Endpoint

**URL:** `POST http://<backend>/api/slots/sensor-update`

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "sensorId": "SENSOR_001",
  "slotId": "SLOT_A1",
  "lotId": "LOT_001",
  "status": "occupied",
  "distance_cm": 12,
  "timestamp": "2025-04-24T10:30:00Z"
}
```

**Status values:** `available`, `occupied`

The backend will:
1. Update the slot status in MongoDB
2. Log the sensor reading
3. Emit `slot:update` via Socket.IO to all connected clients
4. Flag as anomaly if distance is out of expected range

### IP Whitelisting

Add your ESP32 device IPs to `IOT_IP_WHITELIST` in the backend `.env`:

```
IOT_IP_WHITELIST=192.168.1.100,192.168.1.101
```

## API Documentation

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User login
- `POST /api/auth/admin/login` — Admin login

### Lots
- `GET /api/lots` — List all lots
- `GET /api/lots/:id` — Get lot details
- `POST /api/lots` — Create lot (admin)
- `PUT /api/lots/:id` — Update lot (admin)
- `DELETE /api/lots/:id` — Delete lot (admin)

### Slots
- `GET /api/lots/:id/slots` — Get slots by lot
- `PUT /api/slots/:id` — Update slot (admin)
- `POST /api/slots/sensor-update` — IoT sensor update

### Reservations
- `POST /api/reservations` — Create reservation
- `GET /api/reservations/:id` — Get reservation
- `GET /api/reservations/user/:userId` — Get user reservations
- `GET /api/reservations` — Get all reservations (admin)
- `PATCH /api/reservations/:id/cancel` — Cancel reservation
- `PATCH /api/reservations/:id/complete` — Mark completed

### Users
- `GET /api/users` — List users (admin)
- `PATCH /api/users/:id/status` — Toggle user status (admin)

### Reports
- `GET /api/reports/daily` — Daily reservation trends
- `GET /api/reports/hourly-heatmap` — Peak hours heatmap
- `GET /api/reports/revenue` — Revenue by lot
- `GET /api/reports/sensor-logs` — Sensor activity logs

## Socket.IO Events

### Server Emits
- `slot:update` — Slot status changed
- `reservation:new` — New reservation created
- `sensor:offline` — Sensor missed ping

### Client Listens
- Subscribe in `SocketContext.jsx` for global updates
- `MonitorPage.jsx` listens for `slot:update` per lot
- `DashboardPage.jsx` listens for `reservation:new` for live feed

## License

MIT

