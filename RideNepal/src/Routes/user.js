import express from 'express';
import jwt from 'jsonwebtoken';
import { Signup } from '../Model/Signup.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/config.js';
import 'dotenv/config';

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

router.get('/', async (req, res) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res.status(403).json({ message: 'Access Denied. Please log in.' });
  }

  try {
    const tokenParts = tokenHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(403).json({ message: 'Invalid Token Format' });
    }

    const extractedToken = tokenParts[1];
    const verified = jwt.verify(extractedToken, process.env.JWT_SECRET);
    req.user = verified;

    const user = await Signup.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const users = await Signup.find({}, '-otp -otpExpires'); // Excludes OTP-related fields
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
});


// Update user info with image upload
router.put('/:id', upload.single('image'), async (req, res) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(403).json({ message: 'Access Denied. Please log in.' });
    }

    try {
        const tokenParts = tokenHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(403).json({ message: 'Invalid Token Format' });
        }

        const extractedToken = tokenParts[1];
        const verified = jwt.verify(extractedToken, process.env.JWT_SECRET);
        req.user = verified;

        const user = await Signup.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { firstname, lastname, email, phone } = req.body;
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        if (req.file) {
            user.image = req.file.path; // Update with new image URL
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

router.get('/count', async (req, res) => {
  try {
    const userCount = await Signup.countDocuments();
    res.status(200).json({ totalUsers: userCount });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user count', error: error.message });
  }
});


export default router;
