import mongoose, {Document,Model,Schema} from "mongoose";

export interface IvolunteerSchema extends Document { 
  fname:string;
  lname:string;
  email:string;
  phone:string;
  age:number;
  availability:string;
  interest_area:string;
  mode:string;
  message:string;
  createdAt:Date;
  updatedAt:Date;


}
const volunteerSchema = new Schema<IvolunteerSchema>({
  fname: {
    type: String,
    required: true,
    trim: true
  },
  lname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: false
  },
  availability: {
    type: String, // e.g., "Weekends", "Weekdays", "Full-time"
    required: false,
    trim: true
  },
  interest_area: {
    type: String, // e.g., "Teaching", "Fundraising"
    required: false,
    trim: true
  },
  mode: {
    type: String, // e.g., "Online", "Offline"
    required: false,
    trim: true
  },
  message: {
    type: String, // any extra message from volunteer
    required: false,
    trim: true
  }
}, { timestamps: true });

const VolunteerForm:Model<IvolunteerSchema> = mongoose.model<IvolunteerSchema>("VolunteerForm", volunteerSchema);
export default VolunteerForm;
