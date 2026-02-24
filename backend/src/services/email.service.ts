import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: MailOptions): Promise<void> => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ShopX" <noreply@shopx.com>',
        ...options,
    });
};

// ─── Email Templates ─────────────────────────────────────────────────────────

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
    await sendEmail({
        to,
        subject: 'Welcome to ShopX! 🎉',
        html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#f1f5f9;padding:40px;border-radius:12px">
        <h1 style="color:#818cf8">Welcome to ShopX, ${name}! 🛍️</h1>
        <p style="color:#94a3b8">Your account has been created successfully. Start exploring thousands of products.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px">Start Shopping</a>
        <p style="margin-top:32px;font-size:12px;color:#475569">© 2025 ShopX. All rights reserved.</p>
      </div>
    `,
    });
};

export const sendPasswordResetEmail = async (
    to: string,
    name: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
        to,
        subject: 'Reset your ShopX password',
        html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#f1f5f9;padding:40px;border-radius:12px">
        <h1 style="color:#818cf8">Password Reset Request</h1>
        <p style="color:#94a3b8">Hi ${name}, you requested a password reset. Click the button below (expires in 15 minutes):</p>
        <a href="${resetUrl}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px">Reset Password</a>
        <p style="margin-top:24px;color:#ef4444;font-size:13px">If you didn't request this, please ignore this email.</p>
        <p style="margin-top:32px;font-size:12px;color:#475569">© 2025 ShopX. All rights reserved.</p>
      </div>
    `,
    });
};

export const sendOrderConfirmationEmail = async (
    to: string,
    name: string,
    orderId: string,
    totalAmount: number
): Promise<void> => {
    await sendEmail({
        to,
        subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
        html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#f1f5f9;padding:40px;border-radius:12px">
        <h1 style="color:#22c55e">Order Confirmed! ✅</h1>
        <p style="color:#94a3b8">Hi ${name}, your order has been placed successfully.</p>
        <div style="background:#1e293b;padding:20px;border-radius:8px;margin-top:16px">
          <p><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px">Track Order</a>
        <p style="margin-top:32px;font-size:12px;color:#475569">© 2025 ShopX. All rights reserved.</p>
      </div>
    `,
    });
};
