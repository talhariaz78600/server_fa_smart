const mongoose = require('mongoose');

const appointmentchema = new mongoose.Schema({
    userName: { type: String, trim: true, required: true },
    userEmail: { type: String, trim: true, required: true },
    userContact: { type: String, trim: true },
    estimatedBudget: { type: String, trim: true, required: true },
    completionDate: { type: Date, required: true },
    otherInfo: { type: String, trim: true, },
    applicationType: { type: String, trim: true, required: true },
    referenceLink: { type: String, trim: true, },
    projectStatus: { type: String, trim: true, },
    projectFileUrl: { type: String, trim: true }

});

const Appointment = mongoose.model('Appointment', appointmentchema);

module.exports = Appointment;
