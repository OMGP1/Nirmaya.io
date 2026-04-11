/**
 * Twilio SMS Service — SOS Alert Broadcaster
 *
 * Sends emergency SMS alerts to a pre-configured list of
 * verified contacts when an SOS is triggered.
 *
 * Uses Twilio Trial tier — contacts must be verified
 * in the Twilio Console under Phone Numbers > Verified Caller IDs.
 *
 * Environment Variables:
 *   TWILIO_ACCOUNT_SID   - Your Twilio Account SID
 *   TWILIO_AUTH_TOKEN     - Your Twilio Auth Token
 *   TWILIO_PHONE_NUMBER   - Your Twilio phone number (e.g., +1234567890)
 *   SOS_CONTACTS          - Comma-separated verified phone numbers
 */

class TwilioSMSService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilioNumber = process.env.TWILIO_PHONE_NUMBER;
        this.sosContacts = (process.env.SOS_CONTACTS || '')
            .split(',')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        this.client = null;
        this.enabled = false;

        if (this.accountSid && this.authToken && this.twilioNumber) {
            try {
                const twilio = require('twilio');
                this.client = twilio(this.accountSid, this.authToken);
                this.enabled = true;
                console.log(`📱 Twilio SMS Service initialized (${this.sosContacts.length} SOS contacts configured)`);
            } catch (err) {
                console.warn('⚠️  Twilio package not installed — SMS disabled. Run: npm install twilio');
            }
        } else {
            console.warn('⚠️  Twilio credentials not set — SMS alerts disabled');
        }
    }

    /**
     * Broadcast SOS alert SMS to all configured contacts
     *
     * @param {Object} params
     * @param {string} params.patientName   - Name of the patient
     * @param {string} params.reason        - Emergency reason
     * @param {number} params.lat           - Patient latitude
     * @param {number} params.lng           - Patient longitude
     * @param {string} [params.doctorName]  - Assigned doctor name
     * @param {string} [params.appointmentId] - Appointment ID
     * @returns {Promise<{sent: number, failed: number, results: Array}>}
     */
    async broadcastSOS({ patientName, reason, lat, lng, doctorName, appointmentId }) {
        if (!this.enabled || this.sosContacts.length === 0) {
            console.log('📱 SMS broadcast skipped — Twilio not configured or no contacts');
            return { sent: 0, failed: 0, results: [] };
        }

        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

        const message = [
            `SOS! ${patientName}`,
            `${reason}`,
            doctorName ? `Dr: ${doctorName}` : '',
            `Loc: ${mapsLink}`
        ].filter(Boolean).join(' - ');

        const results = [];
        let sent = 0;
        let failed = 0;

        for (const contact of this.sosContacts) {
            try {
                const msg = await this.client.messages.create({
                    body: message,
                    from: this.twilioNumber,
                    to: contact,
                });
                results.push({ contact, status: 'sent', sid: msg.sid });
                sent++;
                console.log(`✅ SOS SMS sent to ${contact} (SID: ${msg.sid})`);
            } catch (err) {
                results.push({ contact, status: 'failed', error: err.message });
                failed++;
                console.error(`❌ SOS SMS failed to ${contact}: ${err.message}`);
            }
        }

        console.log(`📱 SOS Broadcast complete: ${sent} sent, ${failed} failed`);
        return { sent, failed, results };
    }

    /**
     * Send a single SMS message
     */
    async sendSMS(to, body) {
        if (!this.enabled) return null;

        try {
            const msg = await this.client.messages.create({
                body,
                from: this.twilioNumber,
                to,
            });
            return msg;
        } catch (err) {
            console.error(`SMS to ${to} failed:`, err.message);
            return null;
        }
    }
}

// Singleton instance
const smsService = new TwilioSMSService();

module.exports = smsService;
