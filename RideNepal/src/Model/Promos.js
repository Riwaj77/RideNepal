import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  },
  maxUses: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  expiryDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for efficient querying
promoSchema.index({ code: 1 });
promoSchema.index({ status: 1 });
promoSchema.index({ expiryDate: 1 });

const Promo = mongoose.model('Promo', promoSchema);

export default Promo; 