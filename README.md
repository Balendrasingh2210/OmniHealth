# OmniHealth 🌐 — Centralized MERN Health Records

[![React](https://img.shields.io/badge/React-18.x-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-25.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple)](https://vite.dev/)

**OmniHealth** is a centralized, interoperable health records platform. It solves the critical issue of fragmented medical data by allowing **Patients** to securely hold their cross-hospital history, and allowing **Doctors** to seamlessly look up, view, and append medical records (diagnoses, prescriptions, allergies, etc.) during visits or emergencies.

---

## 🎯 Key Features

- **Role-Based Access Control (RBAC):** Distinct `patient` and `doctor` roles, secured by JWTs.
- **Patient Dashboard:** Patients can view their consolidated medical history chronologically, aggregated from an unlimited number of hospitals.
- **Doctor Portal:** Doctors can search for any patient globally by ID to instantly view their comprehensive medical background.
- **Seamless Medical Records Management:** Doctors can append new visits, detailed prescriptions, and track ongoing medications/allergies without dealing with paper trails.
- **Premium UI:** Out-of-the-box bespoke Vanilla CSS design system built for maximum flexibility, responsiveness, and a modern feel.

---

## 🏗 System Architecture

The project follows a standard MERN stack architecture:

```text
omnihealth/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # MongoDB connection strategies
│   ├── middleware/auth.js    # JWT protection middleware
│   ├── models/               # Mongoose schemas (User, MedicalRecord)
│   ├── routes/               # API Endpoints (Auth, Records)
│   ├── server.js             # Production / Real MongoDB server
│   └── server-dev.js         # In-memory Server (Local debugging / Verification)
│
└── frontend/                 # React SPA bundled by Vite
    └── src/
        ├── context/          # React Context (AuthContext) for secure state
        ├── components/       # Reusable components (Navbar)
        ├── pages/            # Main Views (Login, Dashboard)
        └── index.css         # Global Premium Vanilla CSS Design System
```

---

## 🚀 Getting Started

To run OmniHealth locally, you'll need Node.js installed. In order to quickly demonstrate the app without needing a full MongoDB installation, the backend provides a zero-setup **in-memory** server.

### 1. Verification / Local Mode (Zero Database Setup)
This will use the built-in, purely in-memory Node.js datastore. Data resets when the backend stops.

```bash
# Terminal 1: Start Backend (In-Memory variant)
cd backend
npm install
node server-dev.js
# Runs on http://localhost:5001

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 2. Production Mode (With MongoDB)
Requires MongoDB installed locally or an Atlas connection URI.

```bash
# 1. Update backend/.env file:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/omnihealth
# PORT=5001

# 2. Start Backend (Real Database variant)
cd backend
npm install
node server.js

# 3. Start Frontend
cd frontend
npm install
npm run dev
```

> **Note on Ports:** By default, macOS uses Port 5000 for the AirPlay Receiver. OmniHealth is configured to use port `5001` for the backend API by default to prevent conflicts.

---

## 🤝 End-to-End User Flow

1. **Patient Registration:** Navigate to `/login`, hit "Sign up here", select "Patient", and register.
2. **Dashboard Overview:** You arrive in the Patient Portal which shows an empty Medical History.
3. **Doctor Registration:** Logout, then sign up again, but select the "Doctor" role. You'll specify your Hospital and Specialization.
4. **Lookup:** In the Doctor Portal, enter the Patient's ID (e.g., `1` in the local dev server).
5. **Add Visit:** Write the Diagnosis, Prescriptions, and Allergies. Click "Save Record".
6. **Confirmation:** Logout and log back in as the Patient. You will immediately see the updated history on your consolidated timeline!

---

## 🔮 Future Roadmap (Phase 2)

- **Machine Learning Integration:** Python/FastAPI microservice for predictive risk assessment based on the patient's aggregated historical data.
- **OTP Authentication:** Transition from Password/Email to Phone Number + OTP for more robust rural access.
- **Patient Consent Workflows:** Require live patient approval/OTP before a newly searching doctor can unlock their history.

---
*Built with ❤️ utilizing the MERN stack.*