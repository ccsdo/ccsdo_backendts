import express,{Request,Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin,{IadminSchema} from "../models/Admin";
import adminSchema from "../validators/adminValidator";
import validate from "../middlewares/validate";
import loginLimiter from "../utils/rateLimiter";
type AdminRegisterBody = Pick<IadminSchema, "email" | "password">;
const router = express.Router();

// Admin registration (only once – after that, disable it)
router.post("/register", validate(adminSchema),async (req:Request<{}, {}, AdminRegisterBody>, res:Response):Promise<void> => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
       res.status(400).json({ success: false, message: "Admin already exists" });
       return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email:normalizedEmail, password: hashedPassword });
    await admin.save();

    res.status(201).json({ success: true, message: "Admin registered" });
  } catch (err) {
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ success: false, error: message });
  }
});

// Admin login
router.post("/login", loginLimiter, validate(adminSchema), async (req:Request<{}, {}, AdminRegisterBody>, res:Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail:string=email.toLowerCase()
    const admin = await Admin.findOne({ normalizedEmail });
    if (!admin) return res.status(401).json({ success: false, message: "Incorrect email" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password" });

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" } // token valid for 1 hour
    );

    res.json({ success: true, token });
  } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
