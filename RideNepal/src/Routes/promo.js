import express from 'express';
import Promo from '../Model/Promos.js';
import { verifyToken, isAdmin } from '../Middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Modified middleware for development to allow for dev token
const devFriendlyAuth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user from payload
    req.user = decoded;
    
    // If it's a development token or admin, proceed
    if (decoded.id === 'dev-admin-id' || decoded.role === 'admin') {
      return next();
    }
    
    // Otherwise use the normal admin check
    isAdmin(req, res, next);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Public endpoint for validating a promo code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }
    
    const promo = await Promo.findOne({ 
      code: code.toUpperCase(),
      status: 'active',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    });
    
    // Also check usage limits
    if (promo && promo.maxUses !== null && promo.usageCount >= promo.maxUses) {
      return res.status(404).json({ success: false, message: 'Promo code usage limit reached' });
    }
    
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Valid promo code', 
      discount: promo.discount,
      description: promo.description
    });
  } catch (error) {
    console.error('Error validating promo:', error);
    res.status(500).json({ success: false, message: 'Failed to validate promo code', error: error.message });
  }
});

// Public endpoint to increment usage count when a promo is used
router.post('/use', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }
    
    const promo = await Promo.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    
    res.status(200).json({ success: true, message: 'Promo usage recorded' });
  } catch (error) {
    console.error('Error incrementing promo usage:', error);
    res.status(500).json({ success: false, message: 'Failed to record promo usage', error: error.message });
  }
});

// Public endpoint to get all ACTIVE promos
router.get('/active', async (req, res) => {
  try {
    // Find all active promos that aren't expired
    const activePromos = await Promo.find({
      status: 'active',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      promos: activePromos.map(promo => ({
        _id: promo._id,
        code: promo.code,
        discount: promo.discount,
        description: promo.description,
        expiryDate: promo.expiryDate
      }))
    });
  } catch (error) {
    console.error('Error fetching active promos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active promo codes', error: error.message });
  }
});

// Use the development-friendly middleware for admin routes
router.use(devFriendlyAuth);

// Get all promo codes - Admin only
router.get('/', async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, promos });
  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch promo codes', error: error.message });
  }
});

// Get a single promo code by ID - Admin only
router.get('/:id', async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    res.status(200).json({ success: true, promo });
  } catch (error) {
    console.error('Error fetching promo:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch promo code', error: error.message });
  }
});

// Create a new promo code - Admin only
router.post('/', async (req, res) => {
  try {
    const { code, discount, description, maxUses, expiryDate, status } = req.body;
    
    // Check if promo code already exists
    const existingPromo = await Promo.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return res.status(400).json({ success: false, message: 'Promo code already exists' });
    }
    
    // Create new promo
    const newPromo = new Promo({
      code: code.toUpperCase(),
      discount,
      description,
      maxUses: maxUses || null,
      expiryDate: expiryDate || null,
      status: status || 'active'
    });
    
    await newPromo.save();
    res.status(201).json({ success: true, message: 'Promo code created successfully', promo: newPromo });
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(500).json({ success: false, message: 'Failed to create promo code', error: error.message });
  }
});

// Update a promo code - Admin only
router.put('/:id', async (req, res) => {
  try {
    const { code, discount, description, maxUses, expiryDate, status } = req.body;
    
    // If code is being changed, check if new code already exists
    if (code) {
      const existingPromo = await Promo.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      
      if (existingPromo) {
        return res.status(400).json({ success: false, message: 'Promo code already exists' });
      }
    }
    
    // Format the update data
    const updateData = {
      ...(code && { code: code.toUpperCase() }),
      ...(discount !== undefined && { discount }),
      ...(description && { description }),
      ...(maxUses !== undefined && { maxUses }),
      ...(expiryDate !== undefined && { expiryDate }),
      ...(status && { status })
    };
    
    const updatedPromo = await Promo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPromo) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    
    res.status(200).json({ success: true, message: 'Promo code updated successfully', promo: updatedPromo });
  } catch (error) {
    console.error('Error updating promo:', error);
    res.status(500).json({ success: false, message: 'Failed to update promo code', error: error.message });
  }
});

// Delete a promo code - Admin only
router.delete('/:id', async (req, res) => {
  try {
    const deletedPromo = await Promo.findByIdAndDelete(req.params.id);
    
    if (!deletedPromo) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    
    res.status(200).json({ success: true, message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Error deleting promo:', error);
    res.status(500).json({ success: false, message: 'Failed to delete promo code', error: error.message });
  }
});

export default router; 