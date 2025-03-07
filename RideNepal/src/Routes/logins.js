import express from 'express';
import { Signup } from '../Model/Signup.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login Route
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/;
        if (!req.body.phone || !phoneRegex.test(req.body.phone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
        }

        // Check if the phone number exists in the database
        const user = await Signup.findOne({ phone: req.body.phone });

        if (!user) {
            return res.status(404).json({ message: 'Phone number not registered' });
        }

        // Generate JWT token using jsonwebtoken
        const token = jwt.sign(
            { id: user._id, firstname: user.firstname, lastname: user.lastname, email: user.email, phone: user.phone },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        console.log('Error while logging in:', error);
        res.status(500).json({ message: 'Error while logging in', error: error.message });
    }
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
});

export default router;