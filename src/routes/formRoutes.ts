import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";



import ContactForm from "../models/ContactForm";
import DonationForm from "../models/DonationForm";
import ApplicationForm from "../models/ApplicationForm";
import VolunteerForm from "../models/VolunteerForm";
import InternshipForm from "../models/InternshipForm";
import CareerForm from "../models/CareerForm";
import DonationOrder from "../models/DonationOrders";


import validate from "../middlewares/validate";
import auth from "../middlewares/auth";


import contactSchema from "../validators/contactValidator";
import donationSchema from "../validators/donationValidator";
import applicationSchema from "../validators/applicationValidator";
import volunteerSchema from "../validators/volunteerValidator";
import internshipSchema from "../validators/internshipValidator";
import careerSchema from "../validators/careerValidator";
import {
  emailTextforcareer,
  emailTextforapplication,
  emailTextforcontact,
  emailTextfordonation,
  emailTextforinternship,
  emailTextforvolunteer,
  emailTextThankyouClient,
} from "../emailtext";

import mailtoClient from "../utils/sendMailClient";
// const adminSchema = require("../validators/adminValidator");

dotenv.config();
const router = express.Router();


const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  // port:587,
  port: 465,
  // secure:false,        // SSL port
  secure: true,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
});

async function mail(subject: string, text: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL, // where emails go
      subject: subject,
      html: text,
    });
    return true;
  } catch (error) {
    console.error("Mail sending fail from formRoutes", error);
    return false;
  }

}

// Career Form
router.post("/career", validate(careerSchema), async (req: Request, res: Response):Promise<void> => {
  try {
    // console.log("careere")
    const newCareer = new CareerForm(req.body);
    await newCareer.save();
    let emailText: string = emailTextforcareer(newCareer, "career");
    mail(`New career form`, emailText);
    let emailTextThankYou: string = emailTextThankyouClient(newCareer);
    mailtoClient(`Thank you for applying to us`, emailTextThankYou, newCareer.email);
    // console.log("career complete")
    res.status(201).json({ success: true, message: "Career form saved!" });
  } catch (err:unknown) {
    res.status(500).json({ success: false, error: "error in career form saving" });
  }
});

// Internship Form
router.post("/internship", validate(internshipSchema), async (req: Request, res: Response):Promise<void> => {
  try {
    const newInternship = new InternshipForm(req.body);
    await newInternship.save();
    const emailText: string = emailTextforinternship(newInternship, "internship");
    mail(`New internship form`, emailText);
    let emailTextThankYou: string = emailTextThankyouClient(newInternship);
    mailtoClient(`Thank you for applying to us`, emailTextThankYou, newInternship.email);
    res.status(201).json({ success: true, message: "Internship form saved!" });
  } catch (err: unknown) {
    console.log("internship form error: " + err);
    res.status(500).json({ success: false, error: "error in internship form saving" });
  }
});

// Volunteer Form
router.post("/volunteer", validate(volunteerSchema), async (req: Request, res: Response):Promise<void> => {
  try {
    const newVolunteer= new VolunteerForm(req.body);
    await newVolunteer.save();
    const emailText: string = emailTextforvolunteer(newVolunteer, "volunteer");
    mail(`New volunteer form`, emailText);
    let emailTextThankYou: string = emailTextThankyouClient(newVolunteer);
    mailtoClient(`Thank you for applying to us`, emailTextThankYou, newVolunteer.email);
    res.status(201).json({ success: true, message: "Volunteer form saved!" });
  } catch (err:unknown) {
    res.status(500).json({ success: false, error: "error in volunteer form saving" });
  }
});
// Contact Form
router.post("/contact", validate(contactSchema), async (req, res) => {
  try {
    const newContact = new ContactForm(req.body);
    await newContact.save();
    const emailText: string = emailTextforcontact(newContact, "contact");
    mail(`New contact form`, emailText);
    let emailTextThankYou: string = emailTextThankyouClient(newContact);
    mailtoClient(`Thank you for applying to us`, emailTextThankYou, newContact.email);
    res.status(201).json({ success: true, message: "Contact form saved!" });
  } catch (err:unknown) {
    res.status(500).json({ success: false, error: "error in contact form saving" });
  }
});

// Donation Form
router.post("/donation", validate(donationSchema), async (req:Request, res:Response):Promise<void> => {
  try {
    const newDonation = new DonationForm(req.body);
    await newDonation.save();
    const emailText:string = emailTextfordonation(newDonation, "donation");
    mail(`New donation form`, emailText);
    res.status(201).json({ success: true, message: "Donation form saved!" });
  } catch (err:unknown) {
    console.log("form route error: " + err);
    res.status(500).json({ success: false, error: "error in donation form saving" });
  }
});

// Application Form
router.post("/application", validate(applicationSchema), async (req:Request, res:Response):Promise<void> => {
  try {
    const newApp = new ApplicationForm(req.body);
    await newApp.save();
    const emailText:string = emailTextforapplication(newApp, "application");
    mail(`New application form`, emailText);
    let emailTextThankYou:string = emailTextThankyouClient(newApp);
    mailtoClient(`Thank you for applying to us`, emailTextThankYou, newApp.email);
    res.status(201).json({ success: true, message: "Application form saved!" });
  } catch (err:unknown) {
    res.status(500).json({ success: false, error: "error in application form saving" });
  }
});


//fetches all data from mongodb
router.get("/all-forms", auth, async (req:Request, res:Response):Promise<void> => {
  try {
    // Fetch data in parallel for better performance
    const [
      contacts,
      donations,
      applications,
      volunteers,
      internships,
      careers,
      payments
    ] = await Promise.all([
      ContactForm.find(),
      DonationForm.find(),
      ApplicationForm.find(),
      VolunteerForm.find(),
      InternshipForm.find(),
      CareerForm.find(),
      DonationOrder.find()
    ]);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        donations,
        applications,
        volunteers,
        internships,
        careers,
        payments
      },
    });
  } catch (err:unknown) {
    console.error("Error fetching forms:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching forms",
    });
  }
});


export default router;
