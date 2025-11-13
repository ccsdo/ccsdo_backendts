
import mongoose,{Document,Schema,Model} from "mongoose"
export interface IapplicationFormSchema extends Document{

  name:string;
  phone:string;
  email:string;
  statement:string;
  createdAt:string;
  updatedAt:string;
}

const applicationFormSchema = new Schema<IapplicationFormSchema>({
  name: String,
  phone: String,
  email: String,
  statement: String,
}, { timestamps: true });

const ApplicationForm:Model<IapplicationFormSchema>= mongoose.model<IapplicationFormSchema>("ApplicationForm", applicationFormSchema);
export default ApplicationForm