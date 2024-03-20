const express = require('express');
const router = express.Router();
const AdminPanel = require("../../models/adminModel")
const generateToken = require("../../config/generateToken")
const bcrypt = require("bcrypt")


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await AdminPanel.findOne({ adminemail: email });

    if (!admin) {
      return res.status(401).json({ message: 'admin not found', userstatus: 0 });
    }

    if (!admin.isverified) {
      return res.status(401).json({ message: 'admin is not verified' });
    }

    // if (admin.password !== password) {
    //   return res.status(401).json({ message: 'Incorrect password' });
    // }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "invalid credationals" });
    }

    admin.sessionExpiration = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    admin.jwtadmintoken = generateToken(admin._id);
    await admin.save();
    res.status(200).json({ message: 'Successfully Sign In', admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to Sign-In , try Again Later' });
  }
});


// //Admin Sinup  
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingAdmin = await AdminPanel.findOne({ adminemail: email });

    if (existingAdmin) {
      return res.status(401).json({ message: 'Admin already exists', userstatus: 0 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);


    const newAdmin = new AdminPanel({
      adminemail: email,
      password: hashedPassword,
      isverified: true,
    });


    newAdmin.jwtadmintoken = generateToken(newAdmin._id);
    newAdmin.sessionExpiration = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 12 hour
    await newAdmin.save();
    res.status(200).json({ message: 'Admin successfully signed up', admin: newAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to sign up admin, try again later' });
  }
});

//Admin login 

module.exports = router;
