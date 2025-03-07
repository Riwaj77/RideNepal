import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import signuprouter from './Routes/Signups.js';
import loginrouter from './Routes/Logins.js';
import userrouter from './Routes/user.js'; 
import cors from 'cors';
import bodyParser from 'body-parser';


const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization', 
    credentials: true,
}));

// console.log("JWT Secret Key:", process.env.JWT_SECRET);

// Routes
app.use('/signups', signuprouter); 
app.use('/logins', loginrouter); 
app.use('/user', userrouter); 

// MongoDB Connection
mongoose
    .connect('mongodb://localhost:27017/RideNepal', {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    })
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});