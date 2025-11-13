import express,{Request,Response} from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import DonationOrder from "../models/DonationOrders"; // adjust path
import nodemailer from "nodemailer";
import { emailTextfordonationcreation, emailTextfordonationverification, emailTextClient } from "../emailtext";
import mail from "../utils/sendMailClient";
const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Missing Razorpay environment variables!")
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});
if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
  console.error("Missing email environment")
}
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465, // SSL port
  secure: true,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
});

let emailText:string = "";
router.post("/create-order", async (req:Request, res:Response) => {
  try {
    const { donation_type, amount, donor, meta } = req.body;
    // console.log(donation_type)
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });
    const amountPaise = Math.round(Number(amount) * 100); // convert INR to paise
    const receiptId = "donation_" + Date.now();

    const orderOptions = {
      amount: amountPaise,
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1, // auto-capture
      notes: {
        donation_type: donation_type || "one-time",
        donor_name: donor?.first_name + " " + donor?.last_name || "",
        donor_email: donor?.email || "",
      },
    };

    const order = await razorpay.orders.create(orderOptions);
    // console.log("Razorpay order created:", order);
    const donationOrder = new DonationOrder({
      razorpay_order_id: order.id,
      receipt: order.receipt,
      amount: Number(order.amount) / 100,
      currency: order.currency,
      // type: order.notes.donation_type,
      name: order.notes!.donor_name,
      email: order.notes!.donor_email,
      status: order.status, // usually "created"
    });
    await donationOrder.save();

    emailText = emailTextfordonationcreation(req.body, order);
    try {
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.OWNER_EMAIL, // where emails go
        subject: `New donation created: ${donor?.first_name || ""} ${
          donor?.last_name || ""
        }`,
        html: emailText,
      });

      // Save order metadata in DB here (optional)
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        receiptId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error sending mail");
    }
  } catch (err) {
    console.error("create-order error", err);
    return res.status(500).send("Server error creating order");
  }
});

router.post("/verify-payment", async (req, res) => {
   console.log( req.body.donation_payload ? req.body.donation_payload : req.body.payload)
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donation_payload,
    } = req.body;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment verified: store transaction details + donation_payload in DB
      const record = {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        donation_payload,
        verified_at: new Date(),
      };
      // TODO: save `record` into your DB
      await DonationOrder.findOneAndUpdate(
        { razorpay_order_id },
        {
          $set: {
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
            verified_at: new Date(),
            status: "paid",
          },
        },

        { new: true }
      );
      emailText = emailTextfordonationverification(req.body, record);
      try {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.OWNER_EMAIL, // where emails go
          subject: `congratulation donation verified : ${
            req.body.donation_payload?.donor.first_name ? req.body.donation_payload.donor.first_name : req.body.payload?.donor.first_name
          } ${req.body.payload?.donor.last_name ? req.body.payload?.donor.last_name : req.body.donation_payload?.donor.last_name}`,
          html: emailText,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Error sending mail");
      }
      emailText=emailTextClient({donation_payload: req.body.donation_payload ? req.body.donation_payload : req.body.payload,order_id: razorpay_order_id});
      mail(`congratulation donation verified : ${req.body.donation_payload?.donor.first_name ? req.body.donation_payload.donor.first_name : req.body.payload?.donor.first_name}`, emailText, req.body.donation_payload?.donor.email ? req.body.donation_payload.donor.email : req.body.payload?.donor.email);



      return res.json({ success: true, record });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error("verify-payment error", err);
    return res
      .status(500)
      .json({ success: false, error: "Server error verifying payment" });
  }
});

export default router;
