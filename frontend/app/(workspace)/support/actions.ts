"use server"

import nodemailer from "nodemailer"

export interface SupportEmailData {
  name: string
  email: string
  subject: string
  category: string
  message: string
}

export async function sendSupportEmail(data: SupportEmailData) {
  const { name, email, subject, category, message } = data

  if (!email || !subject || !message) {
    return {
      success: false,
      error: "Email, subject, and message are required.",
    }
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    console.error(
      "GMAIL_USER or GMAIL_APP_PASSWORD is not set in the environment variables."
    )
    return {
      success: false,
      error:
        "The support mail server is not configured correctly. Please check your environment variables.",
    }
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  })

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; font-size: 20px; font-weight: 700;">New Support Ticket</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 100px;"><strong>From:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${name || "Anonymous"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Category:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-size: 14px;"><span style="background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${category}</span></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Subject:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${subject}</td>
        </tr>
      </table>
      
      <div style="margin-top: 24px;">
        <h3 style="color: #334155; font-size: 14px; margin-bottom: 8px; font-weight: 600;">Message:</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; border-left: 4px solid #0f172a;">
          <p style="white-space: pre-wrap; margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${message}</p>
        </div>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">This request was submitted from the Architect Support form.</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"${name || "Architect User"}" <${gmailUser}>`,
      replyTo: email,
      to: gmailUser,
      subject: `[Support - ${category}] ${subject}`,
      html: htmlContent,
      text: `Architect Support Ticket\n\nName: ${name || "Anonymous"}\nEmail: ${email}\nCategory: ${category}\nSubject: ${subject}\n\nMessage:\n${message}`,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error in sendSupportEmail Server Action:", error)
    return {
      success: false,
      error: error?.message || "An error occurred while sending the email.",
    }
  }
}
