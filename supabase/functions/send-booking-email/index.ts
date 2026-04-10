// Supabase Edge Function for sending booking confirmation emails
// Deploy with: supabase functions deploy send-booking-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("EMAIL_FROM") || "noreply@healthbook.app";
const FROM_NAME = Deno.env.get("EMAIL_FROM_NAME") || "HealthBook";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
    patientEmail: string;
    patientName: string;
    doctorEmail?: string;
    doctorName: string;
    departmentName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
    reason: string;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function generatePatientEmailHtml(data: BookingEmailRequest): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
        Hi <strong>${data.patientName}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
        Your appointment has been successfully booked. Here are your appointment details:
      </p>
      
      <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Doctor</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">Dr. ${data.doctorName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Department</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.departmentName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Date</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Time</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formatTime(data.appointmentTime)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Reason</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.reason}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Confirmation #</td>
            <td style="padding: 10px 0; color: #4F46E5; font-size: 14px; font-weight: 600; text-align: right;">${data.appointmentId.slice(0, 8).toUpperCase()}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">
        Please arrive 10-15 minutes before your scheduled appointment time. If you need to reschedule or cancel, please do so at least 24 hours in advance.
      </p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://healthcare-appointment-sigma.vercel.app/appointments" 
           style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View Appointment
        </a>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
      <p>© ${new Date().getFullYear()} HealthBook. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateDoctorEmailHtml(data: BookingEmailRequest): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment Booked</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📅 New Appointment Booked</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
        Hi <strong>Dr. ${data.doctorName}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
        A new appointment has been booked with you. Here are the details:
      </p>
      
      <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Patient</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.patientName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Date</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Time</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formatTime(data.appointmentTime)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Reason</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.reason}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://healthcare-appointment-sigma.vercel.app/doctor/appointments" 
           style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View Schedule
        </a>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
      <p>© ${new Date().getFullYear()} HealthBook. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return false;
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: `${FROM_NAME} <${FROM_EMAIL}>`,
                to: [to],
                subject: subject,
                html: html,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Resend API error:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const data: BookingEmailRequest = await req.json();

        // Validate required fields
        if (!data.patientEmail || !data.patientName || !data.doctorName) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const results = {
            patientEmailSent: false,
            doctorEmailSent: false,
        };

        // Send patient confirmation email
        const patientHtml = generatePatientEmailHtml(data);
        const patientSubject = `Appointment Confirmed - ${formatDate(data.appointmentDate)}`;
        results.patientEmailSent = await sendEmail(data.patientEmail, patientSubject, patientHtml);

        // Send doctor notification email if email provided
        if (data.doctorEmail) {
            const doctorHtml = generateDoctorEmailHtml(data);
            const doctorSubject = `New Appointment: ${data.patientName} - ${formatDate(data.appointmentDate)}`;
            results.doctorEmailSent = await sendEmail(data.doctorEmail, doctorSubject, doctorHtml);
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Emails processed",
                ...results
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Edge function error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
