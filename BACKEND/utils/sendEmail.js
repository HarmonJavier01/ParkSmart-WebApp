import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"ParkSmart" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

export default sendEmail;

