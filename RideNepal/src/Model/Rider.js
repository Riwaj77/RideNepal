import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true, trim: true },

    vehicleType: { type: String, required: true, enum: ["motorcycle", "car", "scooter"] },
    vehicleModel: { type: String, required: true, trim: true },
    vehicleYear: { type: Number, required: true },
    licensePlate: { type: String, required: true, unique: true },

    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    licenseImage: { type: String, required: true },  // Cloudinary URL
    insuranceImage: { type: String, required: true }, // Cloudinary URL

    terms: { type: Boolean, required: true, default: false },
    otp: { type: Number },
    otpExpiry: { type: Date },

    createdAt: { type: Date, default: Date.now },
});

export const Rider = mongoose.model('Rider', RiderSchema);

// export default Rider;
