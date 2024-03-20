const express = require('express');
const router = express.Router();
const Appointment = require("../../models/appointmentModel")
const { uploadFile, deleteFile , uploadDocument} = require("../../utils/cloudinary")

// Add Appointment
router.post('/add-appointment', async (req, res) => {
    try {
        const { userName, userEmail, userContact, estimatedBudget, completionDate, otherInfo, applicationType, referenceLink, projectStatus } = req.body;

        let appoitmentFileUrl;
        if (req.files && req.files.projectFile) {
            console.log(req.files.projectFile)
            appoitmentFileUrl = await uploadFile(req.files.projectFile.tempFilePath, "appoitments");
        }
        const newAppointment = new Appointment({
            userName,
            userEmail,
            userContact,
            estimatedBudget,
            completionDate,
            otherInfo,
            applicationType,
            referenceLink,
            projectStatus,
            projectFileUrl: appoitmentFileUrl
        });

        await newAppointment.save();
        res.status(200).json({ message: 'Appointment added successfully', newAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add appointment', error: error.message });
    }
});

// Update Appointment Status
router.put('/:appointmentId/update-status', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { projectStatus } = req.body;

        const existingAppointment = await Appointment.findById(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        existingAppointment.projectStatus = projectStatus;
        await existingAppointment.save();
        res.status(200).json({ message: 'Appointment status updated successfully', updatedAppointment: existingAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update appointment status', error: error.message });
    }
});

// Delete Appointment
router.delete('/:appointmentId/delete-appointment', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (deletedAppointment.projectFileUrl) {
            await deleteFile(deletedAppointment.projectFileUrl);
        }
        res.status(200).json({ message: 'Appointment deleted successfully', deletedAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
    }
});


module.exports = router;