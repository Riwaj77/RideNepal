import express from "express";
import multer from "multer";
import {Rider} from "../Model/Rider.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/config.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Riders",
        allowed_formats: ["jpg", "jpeg", "png"],
        resource_type: "image",
    },
});

const upload = multer({ storage });

// Register a New Rider
router.post("/", upload.fields([{ name: "licenseImage" }, { name: "insuranceImage" }]), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address,  vehicleType, vehicleModel, vehicleYear, licensePlate, licenseNumber, licenseExpiry, terms } = req.body;

        if (!firstName || !lastName || !email || !phone || !address || !vehicleType || !vehicleModel || !vehicleYear || !licensePlate || !licenseNumber || !licenseExpiry || !terms) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!req.files || !req.files.licenseImage || !req.files.insuranceImage) {
            return res.status(400).json({ message: "License and Insurance images are required." });
        }

        const newRider = new Rider({
            firstName,
            lastName,
            email,
            phone,
            address,
            vehicleType,
            vehicleModel,
            vehicleYear,
            licensePlate,
            licenseNumber,
            licenseExpiry,
            licenseImage: req.files.licenseImage[0].path,
            insuranceImage: req.files.insuranceImage[0].path,
            terms,
        });

        await newRider.save();
        res.status(201).json({ message: "Rider registered successfully!", Rider: newRider });

    } catch (error) {
        console.error("Error registering Rider:", error);
        res.status(400).json({ message: "Server error during registration", error: error.message });
    }
});

// Get All Riders
router.get("/", async (req, res) => {
    try {
        const Riders = await Rider.find();
        res.status(200).json(Riders);
    } catch (error) {
        res.status(400).json({ message: "Error retrieving Riders", error: error.message });
    }
});

// // Get a Single Rider by ID
// router.get("/:id", async (req, res) => {
//     try {
//         const rider = await Rider.findById(req.params.id);
//         if (!rider) return res.status(404).json({ message: "Rider not found" });

//         res.status(200).json(rider);
//     } catch (error) {
//         res.status(400).json({ message: "Error retrieving Rider", error: error.message });
//     }
// });

// Update Rider Info
router.put("/:id", upload.fields([{ name: "licenseImage" }, { name: "insuranceImage" }]), async (req, res) => {
    try {
        const updatedFields = req.body;

        if (req.files?.licenseImage) {
            updatedFields.licenseImage = req.files.licenseImage[0].path;
        }
        if (req.files?.insuranceImage) {
            updatedFields.insuranceImage = req.files.insuranceImage[0].path;
        }

        const updatedRider = await Rider.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

        if (!updatedRider) return res.status(404).json({ message: "Rider not found" });

        res.status(200).json({ message: "Rider updated successfully!", Rider: updatedRider });

    } catch (error) {
        res.status(400).json({ message: "Error updating Rider", error: error.message });
    }
});

// Delete a Rider
router.delete("/:id", async (req, res) => {
    try {
        const deletedRider = await Rider.findByIdAndDelete(req.params.id);

        if (!deletedRider) return res.status(404).json({ message: "Rider not found" });

        res.status(200).json({ message: "Rider deleted successfully!" });

    } catch (error) {
        res.status(400).json({ message: "Error deleting Rider", error: error.message });
    }
});

router.get('/count', async (req, res) => {
    try {
      const riderCount = await Rider.countDocuments();
      res.status(200).json({ totalRiders: riderCount });
    } catch (error) {
      res.status(400).json({ message: 'Error retrieving rider count', error: error.message });
    }
  });

// Rider Login Route
router.post("/logins", async (req, res) => {
    try {
        const { phone } = req.body;

        // Find rider by phone number
        const rider = await Rider.findOne({ phone });
        
        if (!rider) {
            return res.status(404).json({ message: "Rider not found with this phone number" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Store OTP in rider document (you might want to add an OTP field to your Rider model)
        rider.otp = otp;
        await rider.save();

        // Create JWT token
        const token = jwt.sign(
            { riderId: rider._id },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "1h" }
        );

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER || "your-email@gmail.com",
                pass: process.env.EMAIL_PASS || "your-email-password"
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || "your-email@gmail.com",
            to: rider.email,
            subject: "Your RideNepal Login OTP",
            text: `Your OTP for login is: ${otp}. This OTP will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "OTP sent successfully",
            email: rider.email,
            token: token
        });

    } catch (error) {
        console.error("Error in rider login:", error);
        res.status(500).json({ message: "Error during login process", error: error.message });
    }
});

// Rider OTP Verification Route
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find rider by email
        const rider = await Rider.findOne({ email });
        
        if (!rider) {
            return res.status(404).json({ message: "Rider not found" });
        }

        // Check if OTP matches and is not expired
        if (!rider.otp || rider.otp !== parseInt(otp)) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Clear the OTP after successful verification
        rider.otp = undefined;
        await rider.save();

        // Create a new token for the authenticated session
        const token = jwt.sign(
            { riderId: rider._id },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "OTP verified successfully",
            token: token
        });

    } catch (error) {
        console.error("Error in rider OTP verification:", error);
        res.status(500).json({ message: "Error during verification process", error: error.message });
    }
});

// Get Rider Profile
router.get("/profile", async (req, res) => {
  try {
    const tokenHeader = req.header('Authorization');
    
    if (!tokenHeader) {
      return res.status(403).json({ message: 'Access Denied. Please log in.' });
    }

    const tokenParts = tokenHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(403).json({ message: 'Invalid Token Format' });
    }

    const token = tokenParts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    const rider = await Rider.findById(decoded.riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Remove sensitive data before sending
    const riderData = {
      firstName: rider.firstName,
      lastName: rider.lastName,
      email: rider.email,
      phone: rider.phone,
      address: rider.address,
      vehicleType: rider.vehicleType,
      vehicleModel: rider.vehicleModel,
      vehicleYear: rider.vehicleYear,
      licensePlate: rider.licensePlate,
      licenseNumber: rider.licenseNumber,
      licenseExpiry: rider.licenseExpiry,
      createdAt: rider.createdAt
    };

    res.status(200).json({
      success: true,
      rider: riderData
    });
  } catch (error) {
    console.error('Error fetching rider profile:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid Token or Error fetching profile',
      error: error.message 
    });
  }
});

// Update Rider Profile
router.put("/profile", upload.fields([{ name: "image" }, { name: "licenseImage" }, { name: "insuranceImage" }]), async (req, res) => {
    try {
        const tokenHeader = req.header('Authorization');
        
        if (!tokenHeader) {
            return res.status(403).json({ message: 'Access Denied. Please log in.' });
        }

        const tokenParts = tokenHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(403).json({ message: 'Invalid Token Format' });
        }

        const token = tokenParts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        
        const rider = await Rider.findById(decoded.riderId);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        const updatedFields = req.body;

        // Handle image uploads
        if (req.files?.image) {
            updatedFields.image = req.files.image[0].path;
        }
        if (req.files?.licenseImage) {
            updatedFields.licenseImage = req.files.licenseImage[0].path;
        }
        if (req.files?.insuranceImage) {
            updatedFields.insuranceImage = req.files.insuranceImage[0].path;
        }

        // Update rider fields
        Object.keys(updatedFields).forEach(key => {
            if (updatedFields[key] !== undefined) {
                rider[key] = updatedFields[key];
            }
        });

        await rider.save();

        res.status(200).json({ 
            success: true,
            message: "Rider updated successfully!",
            rider: rider 
        });

    } catch (error) {
        console.error('Error updating rider profile:', error);
        res.status(400).json({ 
            success: false,
            message: 'Error updating profile',
            error: error.message 
        });
    }
});

export default router;
