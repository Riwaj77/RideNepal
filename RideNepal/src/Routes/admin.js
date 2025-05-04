import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Admin} from '../Model/Admin.js';

const router = express.Router();

// Development only - create a token without authentication
// IMPORTANT: This should be removed or properly secured in production
router.post("/dev-token", (req, res) => {
  // Only allow this in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: "This endpoint is not available in production" });
  }
  
  try {
    // Create a development token
    const token = jwt.sign(
      { id: 'dev-admin-id', email: 'dev@admin.com', role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    // Return the token
    res.status(200).json({
      message: "Development token created",
      token,
      admin: {
        _id: 'dev-admin-id',
        email: 'dev@admin.com'
      }
    });
  } catch (error) {
    console.error("Dev token error:", error);
    res.status(500).json({ message: "Error creating development token", error: error.message });
  }
});

// Admin Registration Route
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }
  
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ email, password: hashedPassword });
  
      // Save to database
      await newAdmin.save();
      res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
});

// Admin Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Return success with token
    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all admins route
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().select('-password'); // Exclude password field
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
