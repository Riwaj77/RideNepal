// import express from 'express';
// import { Login } from '../Model/Login.js'; 
// const router = express.Router();

// // Login Route
// router.post('/', async (req, res) => {
//     try {
//         // Validate required fields
//         if (!req.body.phone) {
//             return res.status(400).json({ message: 'Phone number is required' });
//         }

//         // Create a new Login instance
//         const login = new Login({
//             phone: req.body.phone,
//         });

//         // Save the login data
//         await login.save();
//         console.log('Login saved:', login);
//         res.status(201).json(login);
//     } catch (error) {
//         console.log('Error while login:', error);
//         res.status(400).json({ message: 'Error while login', error: error.message });
//     }
// });

// // Get all logins (for testing purposes)
// router.get('/', async (req, res) => {
//     try {
//         const logins = await Login.find();
//         res.json(logins);
//     } catch (error) {
//         console.error('Error retrieving login data:', error);
//         res.status(500).json({ message: 'Error retrieving login data', error: error.message });
//     }
// });

// // module.exports = router;

// export default router;

import express from 'express';
import { Signup } from '../Model/Signup.js'; // Import Signup schema to check if phone exists
const router = express.Router();

// Login Route
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        
        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/; // Regular expression for 10 digits
        if (!req.body.phone || !phoneRegex.test(req.body.phone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
        }

        // Check if the phone number exists in the database
        const user = await Signup.findOne({ phone: req.body.phone });

        if (!user) {
            return res.status(404).json({ message: 'Phone number not registered' });
        }

        res.status(200).json({ message: 'Phone number found', user: user });
    } catch (error) {
        console.log('Error while logging in:', error);
        res.status(500).json({ message: 'Error while logging in', error: error.message });
    }
});

export default router;
