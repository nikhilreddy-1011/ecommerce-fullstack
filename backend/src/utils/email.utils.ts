import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ─── Order Confirmation ────────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (
    to: string,
    name: string,
    orderId: string,
    totalAmount: number
): Promise<void> => {
    await transporter.sendMail({
        from: `"Nikhil Store 🛍️" <${process.env.SMTP_USER}>`,
        to,
        subject: '✅ Order Confirmed — Your order is on its way!',
        html: `
        <div style="font-family:Inter,sans-serif;background:#0f172a;padding:32px;border-radius:16px;color:#e2e8f0;max-width:520px;margin:auto">
          <h2 style="color:#fff;margin-bottom:4px">Hey ${name}! 👋</h2>
          <p style="color:#94a3b8;margin-bottom:24px">Your order has been placed and confirmed.</p>

          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">Order ID</p>
            <p style="margin:0;color:#fff;font-weight:600;font-family:monospace">#${orderId.slice(-8).toUpperCase()}</p>
            <hr style="border-color:#334155;margin:16px 0"/>
            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">Amount Paid</p>
            <p style="margin:0;color:#fff;font-weight:700;font-size:20px">₹${totalAmount.toLocaleString('en-IN')}</p>
          </div>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders"
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px">
            Track Your Order →
          </a>

          <p style="color:#475569;font-size:12px;margin-top:32px">
            If you have questions, reply to this email or visit our support page.
          </p>
        </div>`,
    });
};

// ─── Password Reset ────────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (
    to: string,
    name: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    await transporter.sendMail({
        from: `"Nikhil Store 🔐" <${process.env.SMTP_USER}>`,
        to,
        subject: '🔐 Reset Your Password',
        html: `
        <div style="font-family:Inter,sans-serif;background:#0f172a;padding:32px;border-radius:16px;color:#e2e8f0;max-width:520px;margin:auto">
          <h2 style="color:#fff;margin-bottom:4px">Password Reset Request</h2>
          <p style="color:#94a3b8;margin-bottom:24px">Hi ${name}, we received a request to reset your password.</p>

          <a href="${resetUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;margin-bottom:24px">
            Reset Password →
          </a>

          <p style="color:#64748b;font-size:13px">This link expires in <strong style="color:#e2e8f0">1 hour</strong>.</p>
          <p style="color:#475569;font-size:12px;margin-top:16px">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>`,
    });
};

// ─── Welcome Email ─────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
    await transporter.sendMail({
        from: `"Nikhil Store 🛍️" <${process.env.SMTP_USER}>`,
        to,
        subject: '🎉 Welcome to Nikhil Store!',
        html: `
        <div style="font-family:Inter,sans-serif;background:#0f172a;padding:32px;border-radius:16px;color:#e2e8f0;max-width:520px;margin:auto">
          <h2 style="color:#fff;margin-bottom:4px">Welcome, ${name}! 🎉</h2>
          <p style="color:#94a3b8;margin-bottom:24px">Your account has been created. Start exploring thousands of products.</p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products"
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px">
            Browse Products →
          </a>

          <p style="color:#475569;font-size:12px;margin-top:32px">Happy Shopping! 🛒</p>
        </div>`,
    });
};

export default transporter;
