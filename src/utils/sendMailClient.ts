import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465, // SSL port
  secure: true,
  auth: {
    user: process.env.SEND_MAIL as string,
    pass: process.env.SEND_MAIL_PASSWORD as string,
  },
});

async function mailtoClient(subject:string, text:string, recipient:string):Promise<boolean> {
  try {
    transporter.sendMail({
      from:`"Crime Control & Social Development Organisation" <${process.env.SEND_MAIL as string}>`,
      to: recipient,
      bcc: process.env.SEND_MAIL as string,
      subject: subject,
      html: text,
    });
    return true
  } catch (error) {
    console.error(error);
    return false;
  }
}
export default mailtoClient;