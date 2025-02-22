// const mongoose = require('mongoose');

import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
});

export const Login = mongoose.model('Login', loginSchema);