
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Signup } from '../Model/Signup.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/config.js';
import multer from 'multer';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'RideNepal',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'image',
    },
});

const upload = multer({ storage });

const router = express.Router();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Use environment variables
        pass: process.env.EMAIL_PASS, 
    },
});

// Generate a 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Signup Route with Image Upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body);

        if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        // Generate OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Save user details with image
        const signup = new Signup({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            otp: otp,
            otpExpires: Date.now() + 5 * 60 * 1000,
            image: req.file ? req.file.path : null, // Save image URL if uploaded
        });

        await signup.save();
        console.log('Signup saved:', signup);

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Your OTP Verification Code',
            text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending OTP email', error: error.message });
            }
            console.log('OTP Email sent:', info.response);
            res.status(201).json({ 
                message: 'Signup successful. OTP sent to email.',
                email: req.body.email // Pass the email along with the message
            });
        });

    } catch (error) {
        console.log('Error during signup:', error);
        res.status(400).json({ message: 'Error while signing up', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const signups = await Signup.find();
        res.json(signups);
    } catch (error) {
        console.error('Error retrieving signup data:', error);
        res.status(500).json({ message: 'Error retrieving signup data', error: error.message });
    }
});

// Edit User (Update Details & Image)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const tokenHeader = req.header('Authorization');
        if (!tokenHeader) {
            return res.status(403).json({ message: 'Access Denied. Please log in.' });
        }

        const tokenParts = tokenHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(403).json({ message: 'Invalid Token Format' });
        }

        const extractedToken = tokenParts[1];
        const verified = jwt.verify(extractedToken, process.env.JWT_SECRET);
        req.user = verified;

        // Find user
        const user = await Signup.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user details
        const { firstname, lastname, email, phone } = req.body;
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        if (req.file) {
            user.image = req.file.path; // Update image URL if a new image is uploaded
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await Signup.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

export default router;
