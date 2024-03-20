const express = require('express');
const router = express.Router();
const User = require("../../models/userModel")



router.get('/get_all_users', async (req, res) => {

    try {
        const users = await User.find()

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'users  not found' });
        }
        res.status(200).json({ message: 'User Fetched Successfully', users });

    } catch (error) {
        res.status(500).json({ message: 'Failed to Fetch Users', error: error.message });
    }

});

router.get('/:id/get_user', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.status) {
            return res.status(404).json({ message: "User is Suspended" });
        }


        res.status(200).json({ message: 'User Data fetched', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch User Data, try Again Later', error: error.message });
    }
});

router.post('/:userId/update-profile', async (req, res) => {
    try {
        const { userId } = req.params
        const { userName, email } = req.body
       
        const currentUser = await User.findOne({ _id: userId });

        if (!currentUser) {
            return res.status(404).json({ message: 'user  not found' });
        }

        if (userName) {
            currentUser.userName = userName
        }
        if (email) {
            currentUser.email = email
        }

       await currentUser.save()
        res.status(200).json({ message: 'User profile Updated Successfully', currentUser });

    } catch (error) {
        res.status(500).json({ message: 'Failed to Update  User Profile', error: error.message });
    }

});


router.delete('/:id/delete_user', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.status) {
            return res.status(404).json({ message: "User is Suspended" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'Account deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to Delete Account, try Again Later', error: error.message });
    }
});


// change user status , suspend or active
router.post('/:id/update_user_status', async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (status) {
            user.status = true;
        } else {
            user.status = false;
        }
        await user.save();

        res.status(200).json({ message: 'User Status Update Successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to Update User, try Again Later', error: error.message });
    }
});

router.get("/active-users", async (req, res) => {
    try {
        const allUsers = await User.find();

        if (!allUsers && allUsers.length === 0) {
            return res.status(404).json({ message: 'users not found' });
        }

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const activeUsers = allUsers.filter(user => {
            const lastLoginDate = new Date(user.lastLogin);
            return lastLoginDate >= oneWeekAgo;
        });
        res.json({ message: 'Active Users fetched Successfully', activeUsers });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch active users', error: error.message });
    }

})

module.exports = router;
