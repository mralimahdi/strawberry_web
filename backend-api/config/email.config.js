const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpService = process.env.SMTP_SERVICE || 'gmail';

let transporter;
if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
        service: smtpService,
        port: 465,
        secure: true,
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        debug: true,
        logger: true
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('SMTP configuration error:', error);
        } else {
            console.log('SMTP server is ready to send emails');
        }
    });
} else {
    // Fallback to simulated email transport (no actual sending)
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.warn('SMTP credentials are not configured. Email sending will be simulated (messages logged only).');
}

module.exports = transporter;
