const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { saveTokensToFile } = require('../utils/tokenUtils');
const User = require('../models/User');

function createTransporter() {
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const smtpService = process.env.SMTP_SERVICE || 'gmail';

    if (smtpUser && smtpPass) {
        return nodemailer.createTransport({
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
    }

    console.warn('SMTP credentials not configured. Falling back to JSON transport for email simulation.');
    return nodemailer.createTransport({ jsonTransport: true });
}

// Fix for CSS MIME type error: serve static files from backend/public/css
router.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));

// Store email counts for rate limiting
global.emailCounts = global.emailCounts || new Map();
const emailCounts = global.emailCounts;

// Create global token storage if it doesn't exist
if (!global.resetTokens) {
    global.resetTokens = new Map();
}

// Function to load tokens from file
async function loadTokensFromFile() {
    try {
        const tokensData = await fs.readFile(path.join(__dirname, '..', 'reset-tokens.json'), 'utf8');
        const tokens = JSON.parse(tokensData);
        global.resetTokens = new Map(Object.entries(tokens));
        console.log('Loaded tokens from file:', global.resetTokens.size);
    } catch (error) {
        console.log('No existing tokens file found, starting with empty tokens map');
        global.resetTokens = new Map();
    }
}

// Load tokens when the server starts
loadTokensFromFile();

// Function to get time until midnight
function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return (midnight - now) / 1000; // Return seconds until midnight
}

// Reset email counts at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        console.log('Clearing daily email limits at midnight');
        emailCounts.clear();
    }
}, 60000); // Check every minute

router.post('/', async (req, res) => {
    try {
        console.log('Received password reset request:', req.body);
        
        if (!req.body.email) {
            console.log('Email is missing from request');
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const userEmail = req.body.email.trim().toLowerCase();
        console.log('Processing reset request for email:', userEmail);

        // Create transporter (will use JSON transport if SMTP not configured)
        const transporter = createTransporter();
        const isJsonTransport = process.env.SMTP_USER ? false : true;
        
        // Verify SMTP connection only if using real SMTP (not JSON transport)
        if (!isJsonTransport) {
            try {
                await new Promise((resolve, reject) => {
                    transporter.verify((error, success) => {
                        if (error) {
                            console.error('SMTP verification failed:', error);
                            reject(error);
                        } else {
                            console.log('SMTP connection verified');
                            resolve(success);
                        }
                    });
                });
            } catch (smtpError) {
                console.error('SMTP connection error:', smtpError);
                return res.status(500).json({ 
                    message: 'Email service is temporarily unavailable. Please try again later.' 
                });
            }
        }
        
        // Check user existence in MongoDB
        let matchingUser;
        try {
            matchingUser = await User.findOne({ email: userEmail, role: 'user' });
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return res.status(500).json({ 
                message: 'Error checking user account. Please try again later.' 
            });
        }


        // Check rate limiting
        const today = new Date().toDateString();
        const emailKey = `${userEmail}_${today}`;
        const emailsSentToday = emailCounts.get(emailKey) || 0;
        const maxDailyEmails = 3;

            if (emailsSentToday >= maxDailyEmails) {
                const timeUntilReset = Math.ceil(getTimeUntilMidnight());
                const hours = Math.floor(timeUntilReset / 3600);
                const minutes = Math.floor((timeUntilReset % 3600) / 60);
                
                console.log(`Rate limit exceeded for ${userEmail}. Attempts today: ${emailsSentToday}`);
                return res.status(429).json({ 
                    message: `Daily limit of ${maxDailyEmails} password reset emails reached. Please try again in ${hours} hours and ${minutes} minutes.`,
                    attemptsUsed: emailsSentToday,
                    maxAttempts: maxDailyEmails,
                    nextResetIn: timeUntilReset
                });
            }

            console.log(`Email attempt ${emailsSentToday + 1}/${maxDailyEmails} for ${userEmail}`);

            // Generate secure reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = Date.now() + 3600000; // 1 hour expiry

            // Store token with expiry
            global.resetTokens.set(resetToken, {
                email: userEmail,
                expiry: tokenExpiry
            });
            
            // Save tokens to file
            await saveTokensToFile();

            // Create reset link
            const resetLink = `http://localhost:5000/reset-password.html?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;

            // Send email
            const mailOptions = {
                to: userEmail,
                from: process.env.SMTP_FROM || 'no-reply@strawberryfarm.com',
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                    <a href="${resetLink}">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 1 hour.</p>
                `
            };

            try {
                console.log('Attempting to send email with options:', {
                    to: mailOptions.to,
                    from: mailOptions.from,
                    subject: mailOptions.subject
                });

                // Skip verification for JSON transport, only verify for real SMTP
                if (!isJsonTransport) {
                    await new Promise((resolve, reject) => {
                        transporter.verify((error, success) => {
                            if (error) {
                                console.error('SMTP verification failed:', error);
                                reject(error);
                            } else {
                                console.log('SMTP connection verified');
                                resolve(success);
                            }
                        });
                    });
                }

                // Then send the email
                const info = await transporter.sendMail(mailOptions);
                
                if (!info || !info.messageId) {
                    throw new Error('Failed to send email: No message ID received');
                }
                
                console.log('Email sent successfully:', {
                    messageId: info.messageId,
                    response: info.response,
                    envelope: info.envelope
                });
                
                // Only update count if email was sent successfully
                emailCounts.set(emailKey, emailsSentToday + 1);

                const remainingEmails = maxDailyEmails - (emailsSentToday + 1);
                res.json({ 
                    message: `Password reset instructions have been sent to your email. You have ${remainingEmails} attempt${remainingEmails === 1 ? '' : 's'} remaining today.`,
                    emailsRemaining: remainingEmails,
                    maxAttempts: maxDailyEmails,
                    attemptsUsed: emailsSentToday + 1
                });
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                // Remove token if email fails
                global.resetTokens.delete(resetToken);

                // Add detailed error message in response for debugging
                res.status(500).json({
                    message: 'Failed to send password reset email. Please try again later.',
                    error: emailError.message,
                    stack: emailError.stack
                });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ 
                message: 'An error occurred while processing your request' 
            });
        }
    });

module.exports = router;
