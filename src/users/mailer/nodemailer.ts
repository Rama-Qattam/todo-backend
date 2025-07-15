import * as nodemailer from 'nodemailer';

async function createTransporter() {
  // If email credentials are provided in environment variables, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Otherwise, create a test account using Ethereal
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendResetEmail(to: string, resetToken: string) {
  const transporter = await createTransporter();
  
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@todoapp.com',
    to,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If using Ethereal test account, log the preview URL
  if (info.messageId) {
    console.log('Message sent: %s', info.messageId);
    // Use the getTestMessageUrl function directly with the info object
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }
  }
  
  return info;
}
