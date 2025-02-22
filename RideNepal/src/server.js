import express from 'express';
import mongoose from 'mongoose';
import signuprouter from './Routes/signups.js';
import loginrouter from './Routes/logins.js';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
}));

app.use('/signups', signuprouter);
app.use('/logins', loginrouter);

mongoose
    .connect('mongodb://localhost:27017/RideNepal', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
