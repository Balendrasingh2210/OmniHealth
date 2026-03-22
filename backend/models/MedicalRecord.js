const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    hospitalName: {
        type: String,
        required: true,
    },
    diagnosis: {
        type: String,
        required: true,
    },
    prescription: [{
        medicineName: String,
        dosage: String,
        duration: String,
    }],
    allergies: [{
        type: String,
    }],
    ongoingMedications: [{
        type: String,
    }],
    notes: {
        type: String,
    },
    dateAdded: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
