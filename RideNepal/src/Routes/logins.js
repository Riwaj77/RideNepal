import express from 'express';
import { Signup } from '../Model/Signup.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();

// Nodemailer Transporter for sending OTP email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Use environment variables
        pass: process.env.EMAIL_PASS, 
    },
});

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Login Route with OTP sending
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

        // Generate OTP and set expiry time (5 minutes)
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

        // Save the OTP in the user's document
        await user.save();

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your OTP Verification Code',
            text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending OTP email', error: error.message });
            }
            console.log('OTP Email sent:', info.response);

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, firstname: user.firstname, lastname: user.lastname, email: user.email, phone: user.phone },
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            // Send the token and email in the response
            res.status(200).json({ 
                message: 'Login successful. OTP sent to email.', 
                token: token, 
                email: user.email  // Pass email along with the token
            });
        });

    } catch (error) {
        console.log('Error while logging in:', error);
        res.status(500).json({ message: 'Error while logging in', error: error.message });
    }
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
});

export default router;
