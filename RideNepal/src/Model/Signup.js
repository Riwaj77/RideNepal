import mongoose from 'mongoose';

const SignupSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

// module.exports = mongoose.model('Signup', SignupSchema);

export const Signup = mongoose.model('Signup', SignupSchema);