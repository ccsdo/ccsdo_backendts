import { z } from "zod";
import sanitizeInput from "../utils/sanitize";

const careerSchema = z.object({
  fname: z.string().min(1, "First name is required").transform(sanitizeInput),
  lname: z.string().min(1, "Last name is required").transform(sanitizeInput),
  email: z.string().email("Invalid email").transform((val:string)=>sanitizeInput(val).toLowerCase()),
  phone: z.string().min(10, "Phone must be 10 digits").max(10, "Phone must be 10 digits").transform(sanitizeInput),
  position: z.string().min(1, "Position is required").transform(sanitizeInput),
  experience: z.string().min(1, "Experience is required").transform(sanitizeInput),
  employment_type: z.string().min(1, "Employment type is required").transform(sanitizeInput),
  message: z.string().optional().transform(sanitizeInput)
});

export default careerSchema;
