import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: false, unique: false },
    pidx: { 
      type: String, 
      unique: true, 
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0; // Ensure pidx is not null or empty
        },
        message: props => `${props.value} is not a valid pidx!`
      }
    },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    dataFromVerificationReq: { type: Object },
    apiQueryFromUser: { type: Object },
    paymentGateway: {
      type: String,
      enum: ["khalti", "wallet", "cash"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["load", "ride"],
      required: true,
      default: "load"
    },
    rideId: { 
      type: String,
      required: function() {
        return this.paymentType === "ride";
      }
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "pending",
    },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
