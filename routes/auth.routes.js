const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { validateRegistration, validateLogin, checkLoggedIn, checkAdmin, verifyToken, isEmailAlreadyRegistered } = require('../middleware/index.middleware');
const router = express.Router();
const tokenBlacklist = [];

router.post('/register', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        // const username = req.body.username;

        const email_check = await isEmailAlreadyRegistered(email);

        if (email_check) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // const securedPassword =  await bcrypt.hash(password, 10, function (error, hash) {
        //     if (error) {
        //         console.error('Error hashing the password:', error);
        //     } else {
        //         console.log('Hashed password:', hash);
        //     }
        // });
        console.log(hashedPassword);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
        console.log(error);
    }
});

router.post('/login',validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Login failed Please check the credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Login failed Please check the credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

router.post('/logout', verifyToken, (req, res) => {
    try {
        // const token = req.header('Authorization');
        const token = req.headers.authorization.split(' ')[1];
        tokenBlacklist.push(token);
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
        console.log(error);
    }
});

module.exports = {tokenBlacklist};
module.exports = router;