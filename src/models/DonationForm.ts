
import mongoose, {Document,Schema,Model} from "mongoose"

export interface IdonationFormSchema extends Document{
  name: string;
  email: string;
  mobile: string;
  dob: string;
  pan: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  donationAmount: number;
  customAmount: number;
  createdAt:Date;
  updatedAt:Date;
}


const donationFormSchema = new Schema<IdonationFormSchema>({
  name: String,
  email: String,
  mobile: String,
  dob: String,
  pan: String,
  country: String,
  state: String,
  city: String,
  address: String,
  pincode: String,
  donationAmount: Number,
  customAmount: Number,
}, { timestamps: true });

const DonationForm:Model<IdonationFormSchema>= mongoose.model<IdonationFormSchema>("DonationForm", donationFormSchema);
export default DonationForm
