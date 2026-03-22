const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

// @route   GET api/records/:patientId
// @desc    Get all medical records for a patient
// @access  Private (Patient themselves or Doctors)
router.get('/:patientId', auth, async (req, res) => {
    try {
        // Ensure user is allowed: Is either a doctor, admin, or the patient themselves
        if (req.user.role === 'patient' && req.user.id !== req.params.patientId) {
            return res.status(403).json({ msg: 'Unauthorized to view this record' });
        }

        const records = await MedicalRecord.find({ patient: req.params.patientId })
            .populate('doctor', 'name hospital specialization')
            .sort({ dateAdded: -1 });
        
        res.json(records);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Patient not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/records
// @desc    Add a new medical record
// @access  Private (Doctors only)
router.post('/', auth, async (req, res) => {
    // Only doctors can add records
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ msg: 'Unauthorized - Only doctors can add records' });
    }

    const { patientId, hospitalName, diagnosis, prescription, allergies, ongoingMedications, notes } = req.body;

    try {
        const newRecord = new MedicalRecord({
            patient: patientId,
            doctor: req.user.id,
            hospitalName,
            diagnosis,
            prescription,
            allergies,
            ongoingMedications,
            notes
        });

        const record = await newRecord.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
