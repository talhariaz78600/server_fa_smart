const mongoose = require('mongoose');

// Define the Verification schema
const AdminPanelSchema = new mongoose.Schema({
    adminemail: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },

    isverified: {
        type: Boolean,
        default: false,
    },
    jwtadmintoken: {
        type: String,
    },
    sessionExpiration: {
        type: String,
    },

});

// Create the Verification model
const AdminPanel = mongoose.model('AdminPanel', AdminPanelSchema);

module.exports = AdminPanel;
