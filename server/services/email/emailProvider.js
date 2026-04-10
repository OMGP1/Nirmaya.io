/**
 * Email Provider Configuration - Resend
 * 
 * Uses Resend API for email delivery (simpler than SMTP).
 * Free tier: 100 emails/day, 3000/month
 * 
 * Setup: Get API key from https://resend.com
 */
const { Resend } = require('resend');
const { logger } = require('../../config/logger');

// Resend client (lazy initialization)
let resendClient = null;

/**
 * Initialize the Resend client
 */
function initializeResend() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        logger.warn('RESEND_API_KEY not configured - emails will be logged only (dev mode)');
        return null;
    }

    resendClient = new Resend(apiKey);
    logger.info('Resend email client initialized');
    return resendClient;
}

/**
 * Get the Resend client (lazy initialization)
 */
function getResendClient() {
    if (!resendClient) {
        return initializeResend();
    }
    return resendClient;
}

/**
 * Get sender information
 */
function getSender() {
    // Resend requires verified domain or use their testing domain
    const email = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const name = process.env.EMAIL_FROM_NAME || 'HealthBook';
    return {
        name,
        email,
        formatted: `${name} <${email}>`
    };
}

/**
 * Send email using Resend API
 */
async function sendEmailWithResend({ to, subject, html, text }) {
    const client = getResendClient();
    const sender = getSender();

    // Dev mode - just log the email
    if (!client) {
        logger.info('📧 Email (dev mode - not sent):', { to, subject });
        return {
            id: 'dev-mode-' + Date.now(),
            success: true
        };
    }

    try {
        const result = await client.emails.send({
            from: sender.formatted,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        logger.info('✅ Email sent successfully', {
            id: result.data?.id,
            to,
            subject,
        });

        return { id: result.data?.id, success: true };
    } catch (error) {
        logger.error('❌ Failed to send email', {
            error: error.message,
            to,
            subject,
        });
        throw error;
    }
}

// Legacy exports for compatibility with emailService.js
function getTransporter() {
    return getResendClient(); // Return client for null check
}

module.exports = {
    getResendClient,
    getSender,
    sendEmailWithResend,
    getTransporter, // Legacy compatibility
    initializeResend,
};
