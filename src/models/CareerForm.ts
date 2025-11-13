
import mongoose,{Document,Schema,Model} from "mongoose"

export interface IcareerSchema extends Document{
  fname:string;
  lname:string;
  email:string;
  phone:string;
  position:string;
  experience:string;
  employment_type:string;
  message:string;
  createdAt: Date;
  updatedAt: Date;
}



const careerSchema = new Schema<IcareerSchema>({
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
  position: {
    type: String, // Job position applied for
    required: true,
    trim: true
  },
  experience: {
    type: String, // e.g., "2 years", "5+ years"
    required: true,
    trim: true
  },
  employment_type: {
    type: String, // e.g., "Full-time", "Part-time", "Internship"
    required: true,
    trim: true
  },
  message: {
    type: String, // optional cover letter or note
    trim: true
  }
}, { timestamps: true });




const CareerForm:Model<IcareerSchema> = mongoose.model<IcareerSchema>("CareerForm", careerSchema);

export default CareerForm;
