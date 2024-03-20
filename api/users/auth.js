const express = require('express');
const router = express.Router();
const User = require("../../models/userModel")
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const transporter = require("../../utils/transpoter")
const VerificationModel = require("../../models/verificationModel")
const generateToken = require("../../config/generateToken")
const { upload, mediaDeleteS3 } = require("../../utils/aws-v3")


router.post('/login', async (req, res) => {
    try {
        const { email, password, } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Invalid Feilds" });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No User Found" });
        }
        if (!user.status) {
            return res.status(404).json({ message: "User is Suspended" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "invalid credationals" });
        }

        user.jwttoken = generateToken(user._id);
        user.sessionExpiration = new Date().getTime() + (1000 * 60 * 60 * 24 * 30); // 30 days in milliseconds
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ message: 'Successfully Sign In', user });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to login User", error: error.message });
    }

});

// // user singup


router.post('/sign-up', upload('Users').single('ProfilePicture'), async (req, res) => {

    try {
        const { userName, email, password } = req.body;

        const file = req.file
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "Invalid Feilds" });
        }

        if (!file) {
            return res.status(400).json({ message: "unable to upload user profile" })

        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({ email });

        if (user) {
            return res.status(404).json({ message: "User Already Exist" });
        }

        const userobj = { userName, email, password: hashedPassword, ProfileImageUrl: file.location, awsbucketObjectkey: file.key }

        const newuser = new User(userobj)
        newuser.status = true;
        newuser.sessionExpiration = new Date().getTime() + (1000 * 60 * 60 * 24 * 30); // 30 days in milliseconds
        newuser.jwttoken = generateToken(newuser._id);
        newuser.lastLogin = new Date();
        await newuser.save();
        res.status(200).json({ message: 'Successfully Sign In', newuser });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to Sign Up, try Again Later', error: error.message });
    }
});



// Route to edit profile picture
router.post('/:userId/edit-profile-picture', upload('Users').single('profilePicture'), async (req, res) => {
    try {
        const { userId } = req.params;

        const file = req.file;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!file) {
            return res.status(400).json({ message: "Unable to upload user profile picture" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.awsbucketObjectkey) {
            await mediaDeleteS3(user.awsbucketObjectkey)
        }
        // Update user profile picture details
        user.ProfileImageUrl = file.location;
        user.awsbucketObjectkey = file.key;

        await user.save();
        res.status(200).json({ message: 'Profile picture updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update profile picture', error: error.message });
    }
});



//User login 
router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    try {
        console.log([email]);

        if (!email) {
            return res.status(400).json({ message: "email not found" })
        }
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "user not found", })
        }

        if (!existingUser.status) {
            return res.status(401).json({ message: 'User is Suspended' });
        }
        existingUser.isemailverified = false
        const existingVerification = await VerificationModel.findOne({ useremail: email });

        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const expirationTime = new Date(Date.now() + 20 * 60 * 1000);

        if (existingVerification) {
            existingVerification.verificationCode = verificationCode;
            existingVerification.expirationTime = expirationTime;
            await existingVerification.save();
        } else {
            const verificationData = new VerificationModel({
                useremail: email,
                verificationCode,
                expirationTime,
            });
            await verificationData.save();
        }

        const mailOptions = {
            from: '"Mind Renewal Ministry Application" <ibrarathar0007@gmail.com>',
            to: email,
            subject: 'Email Verification',
            html: `   
  <p>Mind Renewal Ministry  Application </p>
  <p>Use this Verification code to Complete Signup</p>
  <p>Your verification code is: ${verificationCode}</p>`
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to Sign-In , try Again Later', error: error.message });
    }
});

router.post('/:email/:userOTP/verify_otp', async (req, res) => {
    try {
        const { email, userOTP } = req.params;

        if (!email || !userOTP) {
            return res.status(400).json({ message: "invalid fields" });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No User Found" });
        }

        const verificationData = await VerificationModel.findOne({ useremail: email });

        if (!verificationData) {
            return res.status(404).json({ message: 'Verification data not found' });
        }
        const currentTime = new Date();
        if (currentTime <= verificationData.expirationTime) {
            if (userOTP === verificationData.verificationCode) {
                await VerificationModel.deleteOne({ useremail: email });
                user.isemailverified = true;
                user.status = true;

                await user.save()
                return res.status(200).json({ message: 'email verified successfull', user });

            } else {
                return res.status(401).json({ message: 'Invalid verification code' });
            }
        } else {
            return res.status(400).json({ message: 'Verification code has expired' });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to verify OTP" });
    }

});


router.post('/:userId/add_user_password', async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        // Check if password is provided
        if (!password || !userId) {
            return res.status(400).json({ message: "feilds is required" });
        }

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.status) {
            return res.status(401).json({ message: 'User is Suspended' });
        }
        if (!user.isemailverified) {
            return res.status(401).json({ message: 'User is not verified. Please verify Email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.sessionExpiration = new Date().getTime() + (1000 * 60 * 60 * 24 * 30); // 30 days in milliseconds
        user.jwttoken = generateToken(user._id);;
        user.lastLogin = new Date();

        // Save updated user data
        await user.save();

        return res.status(200).json({ message: 'Password added successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update password" });
    }
});

router.get('/:id/verfiy_user_token', async (req, res) => {
    const { id } = req.params;
    const { authorization } = req.headers;

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (!user.status) {
            return res.status(404).json({ message: "User is Suspended" });
        }

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(400).json({ message: 'Invalid or missing token' });
        }

        const token = authorization.split(' ')[1];

        jwt.verify(token, secretID, (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: 'Invalid Token or Token Expired' });
            }
            // Token is valid, you can use the decoded information if needed
            return res.status(200).json({ message: 'User Data fetched', user });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch User Data, try Again Later', error: error.message });
    }
});



router.post('/:userId/update_token', async (req, res) => {
    try {
        const { userId } = req.params;
        const { updateToken } = req.body;

        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(404).json({ message: "No User Found" });
        }
        if (!existingUser.status) {
            return res.status(404).json({ message: "User is Suspended" });
        }
        if (!updateToken) {
            return res.status(400).json({ message: "Empty Update Token" });
        }
        existingUser.token = updateToken;
        await existingUser.save();
        res.status(200).json({ message: 'Token Updated Successfully', existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to Update Token, try Again Later', error: error.message });
    }
});


module.exports = router;
