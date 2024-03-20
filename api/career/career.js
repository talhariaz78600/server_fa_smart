const express = require('express');
const router = express.Router();
const Career = require("../../models/carrersModel")
const { uploadFile, deleteFile, uploadDocument } = require("../../utils/cloudinary")

// Add Appointment
router.post('/add-career', async (req, res) => {
    try {
        const { userName, userEmail, userContact, expectedSalary, location, jobTitle, skills } = req.body;

        let fileurl;
        if (req.files && req.files.resumeFile) {
            fileurl = await uploadDocument(req.files.resumeFile.tempFilePath, "career");
        }

        const newCareer = new Career({
            userName,
            userEmail,
            userContact,
            expectedSalary,
            location,
            jobTitle,
            skills,
            resumeURL: fileurl,
        });

        await newCareer.save();


        res.status(200).json({ message: 'Appointment added successfully', newAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add appointment', error: error.message });
    }
});

// Get All Career Entries
router.get('/get-all-career', async (req, res) => {
    try {
        const careers = await Career.find();

        if (!careers || careers.length === 0) {
            return res.status(404).json({ message: 'No career entries found' });
        }

        res.status(200).json({ message: 'All career entries fetched successfully', careers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch career entries', error: error.message });
    }
});

// Delete Career
router.delete('/:careerId/delete-career', async (req, res) => {
    try {
        const { careerId } = req.params;
        const deletedCareer = await Career.findByIdAndDelete(careerId);

        if (!deletedCareer) {
            return res.status(404).json({ message: 'Career entry not found' });
        }

        res.status(200).json({ message: 'Career entry deleted successfully', deletedCareer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete career entry', error: error.message });
    }
});


module.exports = router;