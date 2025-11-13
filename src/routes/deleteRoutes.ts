// routes/export.js
import express,{Request,Response} from "express";
const router = express.Router();
import contactForm from "../models/ContactForm";
import applicationForm from "../models/ApplicationForm";
import donationForm from "../models/DonationForm";
import volunteerForm from "../models/VolunteerForm";
import internshipForm from "../models/InternshipForm";
import careerForm from "../models/CareerForm";
import donationOrder from "../models/DonationOrders";

const models = {
  Contacts:contactForm,
  Applications:applicationForm,
  Donations:donationForm,
  Volunteers:volunteerForm,
  Internships:internshipForm,
  Career:careerForm,
  Payments:donationOrder
};

// DELETE all data
router.delete("/delete-all/:formName", async (req:Request, res:Response):Promise<void> => {

    const { formName } = req.params;    
    const formModel = models[formName];
  try {
    await formModel.deleteMany({});
    res.status(200).json({ message: `All records of ${formName} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting records" });
  }
});


export default router;
