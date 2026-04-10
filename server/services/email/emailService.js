/**
 * Email Service
 * 
 * Core email service for sending transactional emails.
 * Uses Resend API with Handlebars templates.
 */
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { sendEmailWithResend, getTransporter, getSender } = require('./emailProvider');
const { logger } = require('../../config/logger');

// Cache compiled templates
const templateCache = {};

/**
 * Load and compile a Handlebars template
 */
function loadTemplate(templateName) {
    if (templateCache[templateName]) {
        return templateCache[templateName];
    }

    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);

    try {
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        templateCache[templateName] = Handlebars.compile(templateSource);
        return templateCache[templateName];
    } catch (error) {
        logger.error(`Failed to load email template: ${templateName}`, error);
        throw new Error(`Email template not found: ${templateName}`);
    }
}

/**
 * Render email with layout
 */
function renderEmail(templateName, data) {
    const layoutTemplate = loadTemplate('layout');
    const bodyTemplate = loadTemplate(templateName);

    // Render body first
    const body = bodyTemplate(data);

    // Render layout with body
    return layoutTemplate({
        ...data,
        body,
        year: new Date().getFullYear(),
        appUrl: process.env.APP_URL || 'http://localhost:5173',
    });
}

/**
 * Generate plain text version from HTML
 */
function htmlToPlainText(html) {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
}

/**
 * Send an email using Resend
 */
async function sendEmail({ to, subject, template, data }) {
    // Render HTML email
    const html = renderEmail(template, {
        ...data,
        recipientEmail: to,
    });

    // Generate plain text fallback
    const text = htmlToPlainText(html);

    // Send via Resend
    const result = await sendEmailWithResend({
        to,
        subject,
        html,
        text,
    });

    logger.info('Email queued for delivery', {
        to,
        subject,
        template,
    });

    return result;
}

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmation(email, appointmentDetails) {
    const { formatDate, formatTime } = getDateFormatters();

    return sendEmail({
        to: email,
        subject: `Appointment Confirmed - ${formatDate(appointmentDetails.startTime)}`,
        template: 'confirmation',
        data: {
            title: 'Appointment Confirmed',
            patientName: appointmentDetails.patientName,
            doctorName: appointmentDetails.doctorName,
            specialization: appointmentDetails.specialization,
            departmentName: appointmentDetails.departmentName,
            appointmentDate: formatDate(appointmentDetails.startTime),
            appointmentTime: formatTime(appointmentDetails.startTime),
            appointmentId: appointmentDetails.appointmentId,
            reason: appointmentDetails.reason,
        },
    });
}

/**
 * Send appointment reminder email (24 hours before)
 */
async function sendAppointmentReminder(email, appointmentDetails) {
    const { formatDate, formatTime } = getDateFormatters();

    return sendEmail({
        to: email,
        subject: `Reminder: Appointment Tomorrow at ${formatTime(appointmentDetails.startTime)}`,
        template: 'reminder',
        data: {
            title: 'Appointment Reminder',
            patientName: appointmentDetails.patientName,
            doctorName: appointmentDetails.doctorName,
            specialization: appointmentDetails.specialization,
            departmentName: appointmentDetails.departmentName,
            appointmentDate: formatDate(appointmentDetails.startTime),
            appointmentTime: formatTime(appointmentDetails.startTime),
            appointmentId: appointmentDetails.appointmentId,
            reason: appointmentDetails.reason,
        },
    });
}

/**
 * Send cancellation email
 */
async function sendCancellationEmail(email, appointmentDetails) {
    const { formatDate, formatTime } = getDateFormatters();

    return sendEmail({
        to: email,
        subject: 'Appointment Cancelled',
        template: 'cancellation',
        data: {
            title: 'Appointment Cancelled',
            patientName: appointmentDetails.patientName,
            doctorName: appointmentDetails.doctorName,
            specialization: appointmentDetails.specialization,
            appointmentDate: formatDate(appointmentDetails.startTime),
            appointmentTime: formatTime(appointmentDetails.startTime),
            cancellationReason: appointmentDetails.cancellationReason,
        },
    });
}

/**
 * Date formatting helpers
 */
function getDateFormatters() {
    return {
        formatDate: (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
        formatTime: (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        },
    };
}

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendAppointmentReminder,
    sendCancellationEmail,
    renderEmail,
};
