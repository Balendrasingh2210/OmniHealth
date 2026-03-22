/**
 * Standalone in-memory server for local verification (no MongoDB needed).
 * Real production uses server.js with a MongoDB URI.
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

const app = express();
app.use(express.json());
app.use(cors());

// ── In-memory stores ──────────────────────────────────────────────
const users = [];
const records = [];
let idCounter = 1;
const newId = () => String(idCounter++);

// ── Helpers ───────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET).user;
        next();
    } catch { res.status(401).json({ msg: 'Invalid token' }); }
};

const makeToken = (user) => jwt.sign(
    { user: { id: user.id, role: user.role } },
    JWT_SECRET,
    { expiresIn: 360000 }
);

// ── Auth routes ───────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role = 'patient', hospital, specialization } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ msg: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { id: newId(), name, email, password: hash, role, hospital, specialization };
    users.push(user);
    return res.json({ token: makeToken(user), role: user.role, name: user.name, _id: user.id });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
    return res.json({ token: makeToken(user), role: user.role, name: user.name, _id: user.id });
});

// GET /api/auth
app.get('/api/auth', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
});

// ── Records routes ────────────────────────────────────────────────

// GET /api/records/:patientId
app.get('/api/records/:patientId', authMiddleware, (req, res) => {
    if (req.user.role === 'patient' && req.user.id !== req.params.patientId) {
        return res.status(403).json({ msg: 'Unauthorized' });
    }
    const patientRecords = records
        .filter(r => r.patient === req.params.patientId)
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .map(r => ({
            ...r,
            doctor: users.find(u => u.id === r.doctorId) || null
        }));
    return res.json(patientRecords);
});

// POST /api/records
app.post('/api/records', authMiddleware, (req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ msg: 'Only doctors can add records' });
    }
    const { patientId, hospitalName, diagnosis, prescription, allergies, ongoingMedications, notes } = req.body;
    const record = {
        _id: newId(),
        patient: patientId,
        doctorId: req.user.id,
        hospitalName,
        diagnosis,
        prescription: prescription || [],
        allergies: allergies || [],
        ongoingMedications: ongoingMedications || [],
        notes,
        dateAdded: new Date().toISOString()
    };
    records.push(record);
    return res.json(record);
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', db: 'in-memory' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`── OmniHealth Dev Server (in-memory) running on port ${PORT} ──`);
    console.log('Note: Data resets when the server restarts. Use MongoDB for persistence.');
});
