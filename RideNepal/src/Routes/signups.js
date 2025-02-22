import express from 'express';
import {Signup} from '../Model/Signup.js';
const router = express.Router();

// Signup Route
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        // Validate required fields
        if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        // Create a new Signup instance
        const signup = new Signup({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone
        });

        // Save the signup data
        await signup.save();
        console.log('Signup saved:', signup);
        res.status(201).json(signup);
    } catch (error) {
        console.log('Error while signup:', error);
        res.status(400).json({ message: 'Error while signup', error: error.message });
    }
});

// Get all signups (for testing purposes)
router.get('/', async (req, res) => {
    try {
        const signups = await Signup.find();
        res.json(signups);
    } catch (error) {
        console.error('Error retrieving signup data:', error);
        res.status(500).json({ message: 'Error retrieving signup data', error: error.message });
    }
});

// module.exports = router;

export default router;