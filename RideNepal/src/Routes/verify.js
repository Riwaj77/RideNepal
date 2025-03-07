// router.post('/verify', async (req, res) => {
//     try {
//         const { phone, otp } = req.body;

//         // Find user by phone and check OTP
//         const user = await Signup.findOne({ phone, otp });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid OTP' });
//         }

//         // Check if OTP is expired
//         if (user.otpExpires < new Date()) {
//             return res.status(400).json({ message: 'OTP expired' });
//         }

//         // Clear OTP after verification
//         user.otp = null;
//         user.otpExpires = null;
//         await user.save();

//         res.status(200).json({ message: 'OTP verified successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error verifying OTP', error: error.message });
//     }
// });

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find the user by email
        const user = await Signup.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP matches and is still valid
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid, proceed with further actions
        res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});
