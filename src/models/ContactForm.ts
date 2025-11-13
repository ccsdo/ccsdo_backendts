
import mongoose,{Document,Schema,Model} from "mongoose";

export interface IcontactFormSchema extends Document{
  fname:string;
  lname:string;
  email:string;
  phone:string;
  message:string;
  createdAt:Date;
  updatedAt:Date

}
const contactFormSchema = new Schema<IcontactFormSchema>({
  fname: String,
  lname: String,
  email: String,
  phone: String,
  message: String,
}, { timestamps: true });

const ContactForm:Model<IcontactFormSchema>= mongoose.model<IcontactFormSchema>("ContactForm", contactFormSchema);
export default ContactForm