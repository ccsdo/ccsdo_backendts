import mongoose,{Document,Model,Schema} from "mongoose";

export interface IadminSchema extends Document{
  email:string;
  password:string;
}
const adminSchema = new Schema<IadminSchema>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin:Model<IadminSchema>= mongoose.model<IadminSchema>("Admin", adminSchema);
export default Admin
