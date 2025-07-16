
import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  console.log("📧 RECEIVED EMAIL IN sendEmail:", email); // ✅ Log first

  if (!email || typeof email !== "string") {
    throw new Error("Recipient email is missing or invalid");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message, // ✅ fix typo from `messgae`
  };

  await transporter.sendMail(options);
};

