import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports (587 uses STARTTLS)
  auth: {
    user: "andriostest@gmail.com",
    pass: "mobc cdmp yhhm deqr"
  }
});

/**
 * Send an email using Gmail SMTP
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: '"SOLCart Delivery" <andriostest@gmail.com>',
      to,
      subject,
      html
    });
    console.log("Email sent successfully to %s: %s", to, info.messageId);
    
    // Log the sent email in the server database if possible (optional logging)
    try {
      const DB_FILE_PATH = require("path").join(process.cwd(), "src", "data", "db.json");
      const fs = require("fs");
      if (fs.existsSync(DB_FILE_PATH)) {
        const store = JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf-8"));
        if (!store.sentEmails) store.sentEmails = [];
        store.sentEmails.push({
          id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          to,
          subject,
          html,
          timestamp: new Date().toISOString()
        });
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
      }
    } catch (dbErr) {
      console.warn("Could not log sent email to db.json:", dbErr);
    }

    return true;
  } catch (error) {
    console.error("Error sending email via Gmail SMTP:", error);
    return false;
  }
}

/**
 * Send Sign-up Verification Email
 */
export async function sendVerificationEmail(toEmail: string, code: string): Promise<boolean> {
  const subject = "Verify your SOLCart account";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #6366f1; text-align: center;">Welcome to SOLCart!</h2>
      <p>Thank you for signing up. Please verify your email address by using the verification code below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background-color: #f3f4f6; padding: 10px 20px; border-radius: 6px; border: 1px dashed #6366f1;">
          ${code}
        </span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="text-align: center; color: #9ca3af; font-size: 12px;">SOLCart - Digital Gift Card Payment Gateway</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject, html });
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(toEmail: string, code: string): Promise<boolean> {
  const subject = "Reset your SOLCart password";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #ef4444; text-align: center;">Password Reset Request</h2>
      <p>We received a request to reset the password for your SOLCart account. Use the code below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background-color: #fef2f2; padding: 10px 20px; border-radius: 6px; border: 1px dashed #ef4444;">
          ${code}
        </span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email and secure your account.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="text-align: center; color: #9ca3af; font-size: 12px;">SOLCart - Digital Gift Card Payment Gateway</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject, html });
}

/**
 * Send Order Receipt Email
 */
export async function sendOrderReceiptEmail(toEmail: string, order: any): Promise<boolean> {
  const subject = `SOLCart Order Receipt #${order.id}`;
  
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">$${item.marketplacePriceUSD.toFixed(2)}</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0;">SOLCart Invoice</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Order #${order.id}</p>
      </div>
      <p>Dear ${order.customerDetails.name},</p>
      <p>Thank you for your purchase! We have successfully received your payment. Here is your receipt:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px; border-bottom: 2px solid #eaeaea; text-align: left;">Item</th>
            <th style="padding: 10px; border-bottom: 2px solid #eaeaea; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #eaeaea; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Paid:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #10b981;">
              ${order.paidSOL ? `${order.paidSOL} SOL` : `$${order.receivedUSDC.toFixed(2)}`}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 5px 0; color: #b45309;">Digital Delivery</h4>
        <p style="margin: 0; font-size: 14px; color: #78350f;">
          Our administration is preparing your digital gift card codes. They will be uploaded directly to your Customer Dashboard as soon as they are processed.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="text-align: center; color: #9ca3af; font-size: 12px;">SOLCart - Digital Gift Card Payment Gateway</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject, html });
}

/**
 * Send Gift Card Code Email
 */
export async function sendGiftCardCodeEmail(toEmail: string, orderId: string, giftCardCode: string): Promise<boolean> {
  const subject = `Your Gift Card Code for Order #${orderId} is Ready!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #10b981; text-align: center;">Your Gift Card Code is Ready!</h2>
      <p>Good news! The administrator has uploaded the gift card code for your order <strong>#${orderId}</strong>.</p>
      
      <div style="text-align: center; margin: 30px 0; background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 20px;">
        <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Gift Card Code</p>
        <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #065f46; background-color: #ffffff; padding: 8px 16px; border: 1px solid #a7f3d0; border-radius: 4px;">
          ${giftCardCode}
        </span>
      </div>

      <p>You can also view this code at any time by logging into your Customer Dashboard on our website.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="text-align: center; color: #9ca3af; font-size: 12px;">SOLCart - Digital Gift Card Payment Gateway</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject, html });
}
