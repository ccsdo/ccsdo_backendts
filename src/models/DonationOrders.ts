// models/DonationOrder.js

import mongoose,{Schema,Document,Model} from "mongoose"

export interface IdonationOrderSchema extends Document{
  razorpay_order_id:string;
  payment_id:string;
  receipt:string;
  amount:number;
  currency:string;
  name:string;
  email:string;
  verified_at:Date;
  createdAt:Date;
  status:string;

}
const donationOrderSchema = new Schema<IdonationOrderSchema>(
  {
    razorpay_order_id: { type: String, required: true },
    payment_id: { type: String },
    receipt: { type: String, required: true },
    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: "INR" },
    name: String,
    email: String,
    verified_at: Date,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "created" }, // created | paid | failed
  },
  { timestamps: true }
);

const DonationOrder:Model<IdonationOrderSchema> = mongoose.model<IdonationOrderSchema>("DonationOrder", donationOrderSchema);
export default DonationOrder