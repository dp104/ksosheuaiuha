import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
// Use placeholder if missing to prevent top-level crash, but validate later
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

// Validate environment variables
const missingVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD'
].filter(key => !process.env[key]);

if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
}

export default async function handler(req, res) {
    try {
        // Enable CORS manually if needed, or rely on Vercel's same-origin
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        if (missingVars.length > 0) {
            return res.status(500).json({
                success: false,
                message: `Server Error: Missing environment variables: ${missingVars.join(', ')}. Please add them in Vercel Settings.`
            });
        }

        const { email } = req.body;

        // Validate email
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        try {
            // Get client info (Vercel provides these headers)
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];

            console.log('💾 Attempting to insert into database:', email);

            // Insert into database
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .insert([
                    {
                        id: crypto.randomUUID(),
                        email: email.toLowerCase().trim(),
                        ip_address: ipAddress,
                        user_agent: userAgent
                    }
                ])
                .select();

            if (error) {
                // Check for duplicate email
                if (error.code === '23505') {
                    console.log('⚠️ Duplicate email:', email);
                    return res.status(409).json({
                        success: false,
                        message: 'This email is already subscribed to our newsletter!'
                    });
                }

                console.error('❌ Database error:', JSON.stringify(error, null, 2));
                return res.status(500).json({
                    success: false,
                    message: 'Failed to subscribe. Please try again later.'
                });
            }

            // Send welcome email
            try {
                await sendWelcomeEmail(email);
                console.log(`✅ Subscription successful for: ${email}`);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the request if email fails - subscription is still saved
            }

            return res.status(201).json({
                success: true,
                message: 'Successfully subscribed! Check your email for confirmation.',
                data: data ? data[0] : null
            });

        } catch (error) {
            console.error('Subscription error:', error);
            return res.status(500).json({
                success: false,
                message: 'An unexpected error occurred. Please try again.'
            });
        }
    } catch (criticalError) {
        console.error('Critical Server Error:', criticalError);
        return res.status(500).json({
            success: false,
            message: `Critical Server Error: ${criticalError.message}`
        });
    }
}

async function sendWelcomeEmail(email) {
    const mailOptions = {
        from: {
            name: 'ProjectsSuite',
            address: process.env.GMAIL_USER
        },
        to: email,
        subject: 'Welcome to ProjectsSuite! 🚀',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .emoji { font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="header"><h1 style="margin: 0;">Welcome to ProjectsSuite! 🚀</h1></div>
        <div class="content">
          <p>Hi there!</p>
          <p>Thank you for subscribing to the <strong>ProjectsSuite Newsletter</strong>! Your #1 destination for Major & Minor Student Projects.</p>
          <div class="feature"><span class="emoji">🎓</span> <strong>Student Projects</strong> - Complete source codes & documentation</div>
          <div class="feature"><span class="emoji">💻</span> <strong>Web Development</strong> - Custom website building services</div>
          <div class="feature"><span class="emoji">🛠️</span> <strong>Software Solutions</strong> - Custom software for your specific needs</div>
          <div class="feature"><span class="emoji">🎁</span> <strong>Exclusive Offers</strong> - Get special discounts for students</div>
          <p style="margin-top: 30px;">Stay tuned for amazing content and updates!</p>
          <p>Best regards,<br><strong>The ProjectsSuite Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ProjectsSuite. All rights reserved.</p>
          <p style="font-size: 12px; color: #9ca3af;">You're receiving this email because you subscribed to our newsletter.</p>
        </div>
      </body>
      </html>
    `
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    return transporter.sendMail(mailOptions);
}
