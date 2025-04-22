import express from 'express';
import { Signup } from '../Model/Signup.js';

const router = express.Router();

// OTP Verification Route
router.post('/', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find the user by email
        const user = await Signup.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP matches and is still valid
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP code has expired' });
        }

        // OTP is valid, proceed with further actions (e.g., login success)
        res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});

// GET method to check OTP status
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find the user by email
        const user = await Signup.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP has expired
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP code has expired' });
        }

        // Check if OTP has been verified already
        if (user.otpVerified) {
            return res.status(200).json({ message: 'OTP already verified' });
        }

        // OTP is valid and not expired
        res.status(200).json({ message: 'OTP is valid and unverified' });

    } catch (error) {
        console.error('Error fetching OTP status:', error);
        res.status(500).json({ message: 'Error fetching OTP status', error: error.message });
    }
});

export default router;
