import { ANNOUNCEMENT_STYLES } from '@/data/admin/announcements';
import { db } from '@/lib/db';
import { volunteerApplications } from '@/lib/db/schema';
import { AnnouncementType } from '@/types';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function sendApplicationReceivedEmail(
  to: string,
  firstName: string,
  applicationId: string,
) {
  await resend.emails.send({
    from: `MDRRMO Mansalay <${FROM}>`,
    to,
    subject: 'Your volunteer application has been received — MDRRMO Mansalay',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">MDRRMO Mansalay</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Application Received</p>
        </div>
        <h2 style="color: #1f2937;">Hi ${firstName}, we got your application!</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          Your volunteer application (ID: <strong>${applicationId}</strong>) has been successfully submitted. Our team will review it within <strong>3–5 business days</strong>.
        </p>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>What happens next?</strong><br/>
            1. MDRRMO staff will review your application and documents<br/>
            2. You will receive an email with the decision<br/>
            3. If approved, you will be contacted for orientation
          </p>
        </div>
        <a href="${APP_URL}/profile"
          style="display: inline-block; background: #f97316; color: white; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
          Track Your Application
        </a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          MDRRMO Mansalay · mdrrmo@mansalay.gov.ph
        </p>
      </div>
    `,
  });
}

export async function sendApplicationApprovedEmail(
  to: string,
  firstName: string,
) {
  await resend.emails.send({
    from: `MDRRMO Mansalay <${FROM}>`,
    to,
    subject: '🎉 Your MDRRMO volunteer application has been approved!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0;">Application Approved! 🎉</h1>
        </div>
        <h2 style="color: #1f2937;">Congratulations, ${firstName}!</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          Your volunteer application has been <strong style="color: #16a34a;">approved</strong> by MDRRMO Mansalay. Welcome to the team! You will be contacted by our staff for the next steps including orientation and deployment scheduling.
        </p>
        <a href="${APP_URL}/profile"
          style="display: inline-block; background: #f97316; color: white; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
          View Your Profile
        </a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">MDRRMO Mansalay · mdrrmo@mansalay.gov.ph</p>
      </div>
    `,
  });
}

export async function sendApplicationRejectedEmail(
  to: string,
  firstName: string,
  reason?: string,
) {
  await resend.emails.send({
    from: `MDRRMO Mansalay <${FROM}>`,
    to,
    subject: 'Update on your MDRRMO volunteer application',
    html: `
     <div
      style="
        font-family: sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      "
    >
      <div
        style="
          background: red;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 24px;
        "
      >
        <h1 style="color: white; margin: 0">Application Update</h1>
      </div>
      <h2 style="color: #1f2937">Hi ${firstName},</h2>
      <p style="color: #6b7280; line-height: 1.6">
        After careful review, we are unable to approve your volunteer
        application at this time.
      </p>
      ${
        reason
          ? `<div
        style="
          background: #f9fafb;
          border-left: 4px solid #f97316;
          padding: 16px;
          margin: 16px 0;
        "
        ><p style="margin: 0; color: #374151"
          ><strong>Reason:</strong> ${reason}</p
        ></div
      >`
          : ''
      }
      <p style="color: #6b7280; line-height: 1.6">
        You are welcome to re-apply after addressing any noted concerns. For
        questions, please contact our office directly at mdrrmo@mansalay.gov.ph.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0" />
      <p style="color: #9ca3af; font-size: 12px"
        >MDRRMO Mansalay · mdrrmo@mansalay.gov.ph</p
      >
    </div>
    `,
  });
}

function buildAnnouncementEmailHtml(
  firstName: string,
  announcement: { title: string; body: string; type: AnnouncementType },
) {
  const style = ANNOUNCEMENT_STYLES[announcement.type];
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: ${style.gradient}; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">MDRRMO Mansalay</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">${style.icon} ${style.label}</p>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 8px;">Hi ${firstName},</h2>
      <h3 style="color: #111827; margin: 0 0 12px;">${announcement.title}</h3>
      <p style="color: #6b7280; line-height: 1.6; white-space: pre-wrap;">${announcement.body}</p>
      <a href="${APP_URL}/profile"
        style="display: inline-block; margin-top: 16px; background: #f97316; color: white; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        View in Volunteer Portal
      </a>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">
        MDRRMO Mansalay · mdrrmo@mansalay.gov.ph<br/>
        You're receiving this because you're an approved MDRRMO volunteer.
      </p>
    </div>
  `;
}

export async function sendAnnouncementToApprovedVolunteers(announcement: {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
}) {
  const recipients = await db
    .select({
      email: volunteerApplications.email,
      firstName: volunteerApplications.firstName,
    })
    .from(volunteerApplications)
    .where(eq(volunteerApplications.applicationStatus, 'approved'));

  if (recipients.length === 0) return { sent: 0 };

  const style = ANNOUNCEMENT_STYLES[announcement.type];
  const subjectPrefix =
    announcement.type === 'urgent' ? '🚨 URGENT: ' : `${style.icon} `;

  const emails = recipients.map((r) => ({
    from: `MDRRMO Mansalay <${FROM}>`,
    to: r.email,
    subject: `${subjectPrefix}${announcement.title}`,
    html: buildAnnouncementEmailHtml(r.firstName, announcement),
  }));

  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100);
    await resend.batch.send(chunk);
    sent += chunk.length;
  }

  return { sent };
}
