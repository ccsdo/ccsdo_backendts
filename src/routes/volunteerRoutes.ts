import express,{Request,Response} from "express";
const router = express.Router();
import volunteerSchema from "../validators/volunteerValidator";
import VolunteerForm from "../models/VolunteerForm";
import validate from "../middlewares/validate";

// Volunteer Form
router.post("/volunteer", validate(volunteerSchema),async (req:Request, res:Response) => {
  try {
    const newVolunteer = new VolunteerForm(req.body);
    await newVolunteer.save();
    res.status(201).json({ success: true, message: "Volunteer form saved!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

export default router;