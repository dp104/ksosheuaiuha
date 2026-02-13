const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready to send emails');
  }
});

/**
 * Send welcome email to new subscriber
 * @param {string} email - Subscriber's email address
 * @returns {Promise} - Email send result
 */
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
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #667eea;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .emoji {
            font-size: 24px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Welcome to ProjectsSuite! 🚀</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>Thank you for subscribing to the <strong>ProjectsSuite Newsletter</strong>! Your #1 destination for Major & Minor Student Projects.</p>
          
          <p>Here's what you can expect from us:</p>
          
          <div class="feature">
            <span class="emoji">🎓</span> <strong>Student Projects</strong> - Complete source codes & documentation for Major/Minor projects
          </div>
          
          <div class="feature">
            <span class="emoji">💻</span> <strong>Web Development</strong> - Custom website building services
          </div>
          
          <div class="feature">
            <span class="emoji">🛠️</span> <strong>Software Solutions</strong> - Custom software for your specific needs
          </div>
          
          <div class="feature">
            <span class="emoji">🎁</span> <strong>Exclusive Offers</strong> - Get special discounts for students
          </div>
          
          <p style="margin-top: 30px;">Stay tuned for amazing content and updates!</p>
          
          <p>Best regards,<br>
          <strong>The ProjectsSuite Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ProjectsSuite. All rights reserved.</p>
          <p style="font-size: 12px; color: #9ca3af;">
            You're receiving this email because you subscribed to our newsletter.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ProjectsSuite! 🎉

Hi there!

Thank you for subscribing to the ProjectsSuite Newsletter! Your #1 destination for Major & Minor Student Projects.

Here's what you can expect from us:

🎓 Student Projects - Complete source codes & documentation for Major/Minor projects
💻 Web Development - Custom website building services
🛠️ Software Solutions - Custom software for your specific needs
🎁 Exclusive Offers - Get special discounts for students

Stay tuned for amazing content and updates!

Best regards,
The ProjectsSuite Team

© ${new Date().getFullYear()} ProjectsSuite. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

/**
 * Send new project notification to subscriber
 * @param {string} email - Subscriber's email address
 * @param {object} project - Project details { title, description, image, category, link }
 * @returns {Promise} - Email send result
 */
async function sendNewProjectEmail(email, project) {
  const { title, description, image, category, link } = project;

  const mailOptions = {
    from: {
      name: 'ProjectsSuite Updates',
      address: process.env.GMAIL_USER
    },
    to: email,
    subject: `New Project Alert: ${title} 🚀`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f4f4f5;
          }
          .container {
            background-color: white;
            margin: 20px auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 800;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .image-container {
            width: 100%;
            height: 250px;
            background-color: #f3f4f6;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .project-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .content {
            padding: 40px 30px;
          }
          .badge {
            display: inline-block;
            background-color: #eff6ff;
            color: #2563eb;
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 15px;
            color: #111827;
          }
          .description {
            color: #4b5563;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.8;
          }
          .btn {
            display: block;
            width: 100%;
            background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            text-align: center;
            padding: 16px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: opacity 0.2s;
          }
          .btn:hover {
            opacity: 0.9;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Project Added! ✨</h1>
            <p>Check out the latest addition to our portfolio</p>
          </div>
          
          ${image ? `
          <div class="image-container">
            <img src="${image}" alt="${title}" class="project-image" />
          </div>
          ` : ''}
          
          <div class="content">
            <span class="badge">${category}</span>
            <h2 class="title">${title}</h2>
            <p class="description">${description}</p>
            
            <a href="${link || 'https://projects-suite.netlify.app'}" class="btn">View Project Details</a>
            
            <div class="divider"></div>
            
            <p style="text-align: center; color: #6b7280; margin: 0;">
              Have questions? Reply to this email!
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ProjectsSuite. All rights reserved.</p>
            <p>You received this email because you are subscribed to new project alerts.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Project Alert: ${title} 🚀

We've just added a new project to ProjectsSuite!

Title: ${title}
Category: ${category}

${description}

View Project: ${link || 'https://projects-suite.netlify.app'}

© ${new Date().getFullYear()} ProjectsSuite
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Project notification sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending project notification to ${email}:`, error);
    // Don't throw here to prevent stopping the loop in the caller
    return { success: false, error };
  }
}

module.exports = { sendWelcomeEmail, sendNewProjectEmail };
