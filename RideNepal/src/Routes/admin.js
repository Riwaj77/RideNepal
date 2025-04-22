import express from 'express';
import bcrypt from 'bcrypt';
import {Admin} from '../Model/Admin.js';

const router = express.Router();

// **Admin Login Route**
router.post("/", async (req, res) => {
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

router.get("/", async (req, res) => {
    try {
      const admins = await Admin.find();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

export default router;
