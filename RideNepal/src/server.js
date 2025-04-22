import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import signuprouter from './Routes/Signups.js';
import loginrouter from './Routes/Logins.js';
import userrouter from './Routes/user.js'; 
import riderrouter from './Routes/riders.js';
import adminrouter from './Routes/admin.js';
import verifyrouter from './Routes/verify.js';
import paymentRoutes from './Routes/payments.js';
import rideHistoryRouter from './Routes/ridehistories.js';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.FRONTEND_URI || "http://localhost:5173",
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/RideNepal")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Routes
app.use('/signups', signuprouter); 
app.use('/logins', loginrouter); 
app.use('/user', userrouter); 
app.use('/riders', riderrouter);
app.use('/admin', adminrouter);
app.use('/verify-otp', verifyrouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/ridehistories', rideHistoryRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});