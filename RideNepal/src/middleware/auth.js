import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../Model/Signup.js';


if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined. Check your .env file!");
} else {
  console.log(" JWT_SECRET is loaded.");
}

const auth = (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  console.log("Received Authorization Header:", tokenHeader);

  if (!tokenHeader) {
    return res.status(403).json({ message: 'Access Denied' });
  }

  const tokenParts = tokenHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(403).json({ message: 'Invalid Token Format' });
  }

  const extractedToken = tokenParts[1];
  console.log("Extracted Token:", extractedToken);

  try {
    const verified = jwt.verify(extractedToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ message: 'Server error when checking permissions' });
  }
};

export default auth;
