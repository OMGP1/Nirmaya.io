/**
 * Email Services Index
 * 
 * Central export for email functionality.
 */
const emailService = require('./emailService');
const emailProvider = require('./emailProvider');

module.exports = {
    ...emailService,
    ...emailProvider,
};
