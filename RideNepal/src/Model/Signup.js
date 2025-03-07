import mongoose from 'mongoose';

const SignupSchema = new mongoose.Schema({
  image : {
    type: String,
    required: false,

  },
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
    unique:true,
  },
  otp: {
    type: String,
  }, 
 
  otpExpires:{
    type: Date,
  } 
});

// module.exports = mongoose.model('Signup', SignupSchema);

export const Signup = mongoose.model('Signup', SignupSchema);