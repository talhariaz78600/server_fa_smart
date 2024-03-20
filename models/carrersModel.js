const mongoose = require('mongoose');

const careerchema = new mongoose.Schema({
    userName: { type: String, trim: true, required: true },
    userEmail: { type: String, trim: true, required: true },
    userContact: { type: String, trim: true, required: true },
    expectedSalary: { type: String, trim: true, required: true },
    location: { type: String, trim: true, required: true },
    jobTitle: { type: String, trim: true, required: true },
    skils: { type: String, trim: true, required: true },
    resumeURL: { type: String, trim: true, required: true },

});

const Career = mongoose.model('Career', careerchema);

module.exports = Career;
