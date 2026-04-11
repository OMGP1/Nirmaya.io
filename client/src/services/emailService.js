/**
 * Email Service
 * 
 * Sends booking confirmation emails using Resend API directly.
 * This avoids Edge Function deployment complexity.
 */

// Resend API configuration
const RESEND_API_KEY = 're_Secgsho7_FYojaTqkAe3QeWD1sjrRmJ8J';
const FROM_EMAIL = 'onboarding@resend.dev'; // Use Resend test domain

/**
 * Format date for email display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format time for email display
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Generate patient confirmation email HTML
 */
function generatePatientEmailHtml(data) {
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
      <p>© ${new Date().getFullYear()} Niramaya. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate doctor notification email HTML
 */
function generateDoctorEmailHtml(data) {
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
      <p>© ${new Date().getFullYear()} Niramaya. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send email via Resend API
 */
async function sendViaResend(to, subject, html) {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `Niramaya <${FROM_EMAIL}>`,
                to: [to],
                subject: subject,
                html: html,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            return { success: false, error: result };
        }

        console.log('✅ Email sent successfully:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

/**
 * Send booking confirmation emails to patient and doctor
 */
export async function sendBookingConfirmationEmails(data) {
    const results = {
        patientEmailSent: false,
        doctorEmailSent: false,
    };

    try {
        // Send patient confirmation email
        if (data.patientEmail) {
            const patientHtml = generatePatientEmailHtml(data);
            const patientSubject = `Appointment Confirmed - ${formatDate(data.appointmentDate)}`;
            const patientResult = await sendViaResend(data.patientEmail, patientSubject, patientHtml);
            results.patientEmailSent = patientResult.success;
        }

        // Send doctor notification email
        if (data.doctorEmail) {
            const doctorHtml = generateDoctorEmailHtml(data);
            const doctorSubject = `New Appointment: ${data.patientName} - ${formatDate(data.appointmentDate)}`;
            const doctorResult = await sendViaResend(data.doctorEmail, doctorSubject, doctorHtml);
            results.doctorEmailSent = doctorResult.success;
        }

        console.log('Email notification results:', results);
        return results;
    } catch (error) {
        console.error('Email notification error:', error);
        return results;
    }
}
