// Netlify Function to send quote request notifications via MessageBird SMS + Email
// This function will be called when a customer submits a quote request

const https = require('https');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the quote request data from the request
    const quoteData = JSON.parse(event.body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      service,
      message
    } = quoteData;

    // Create SMS message (shorter for SMS)
    const smsMessage = `🔔 NEW QUOTE REQUEST!
Customer: ${firstName} ${lastName}
Phone: ${phone}
Service: ${service}
Message: ${message}`;

    // Create email message (detailed HTML)
    const emailSubject = `New Quote Request - ${firstName} ${lastName}`;
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .field { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #667eea; }
    .label { font-weight: bold; color: #667eea; }
    .value { margin-top: 5px; }
    .message-box { background: #fff3cd; border-left: 3px solid #ffc107; padding: 15px; margin: 15px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">💬 New Quote Request</h2>
      <p style="margin: 5px 0 0 0;">Aplus+ Cleaning Services</p>
    </div>
    <div class="content">
      <p>You have received a new quote request from your website:</p>
      
      <div class="field">
        <div class="label">Customer Name</div>
        <div class="value">${firstName} ${lastName}</div>
      </div>
      
      <div class="field">
        <div class="label">Phone Number</div>
        <div class="value"><a href="tel:${phone}">${phone}</a></div>
      </div>
      
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>
      
      <div class="field">
        <div class="label">Service Requested</div>
        <div class="value">${service}</div>
      </div>
      
      <div class="message-box">
        <div class="label">Customer Message</div>
        <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${message}</div>
      </div>
      
      <div class="footer">
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Contact the customer within 24 hours</li>
          <li>Prepare a detailed quote based on their requirements</li>
          <li>Send quote via email or phone call</li>
        </ul>
        <p style="margin-top: 15px;">This is an automated notification from your website quote request system.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Business contact details
    const businessPhone = '+447424185232';
    const businessEmail = 'info@apluscleaningservices.uk';

    // Get credentials from environment variables
    const MESSAGEBIRD_API_KEY = process.env.MESSAGEBIRD_API_KEY;

    let smsResult = null;
    let emailResult = null;

    // Send SMS via MessageBird
    if (MESSAGEBIRD_API_KEY) {
      try {
        const postData = JSON.stringify({
          originator: 'Aplus+',
          recipients: [businessPhone],
          body: smsMessage
        });

        const options = {
          hostname: 'rest.messagebird.com',
          port: 443,
          path: '/messages',
          method: 'POST',
          headers: {
            'Authorization': `AccessKey ${MESSAGEBIRD_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        smsResult = await new Promise((resolve, reject) => {
          const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  resolve(JSON.parse(data));
                } catch (e) {
                  resolve({ raw: data });
                }
              } else {
                reject(new Error(`MessageBird API error: ${res.statusCode} - ${data}`));
              }
            });
          });
          
          req.on('error', (error) => {
            reject(error);
          });
          
          req.write(postData);
          req.end();
        });

        console.log('SMS sent successfully via MessageBird:', smsResult);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Continue to email even if SMS fails
      }
    } else {
      console.log('MessageBird not configured. SMS would be sent to:', businessPhone);
    }

    // Send Email notification (logged for now)
    try {
      const emailData = {
        to: businessEmail,
        from: 'noreply@apluscleaningservices.uk',
        subject: emailSubject,
        html: emailBody,
        text: `New Quote Request

Customer: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}
Service: ${service}

Customer Message:
${message}

Please contact the customer within 24 hours to provide a quote.`
      };

      // Log email data (in production, integrate with email service)
      console.log('Email notification prepared:', {
        to: businessEmail,
        subject: emailSubject,
        quoteData
      });

      emailResult = { status: 'logged', to: businessEmail };

    } catch (emailError) {
      console.error('Email preparation failed:', emailError);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Quote request confirmed',
        notifications: {
          sms: smsResult ? { sent: true, id: smsResult.id } : { sent: false, reason: 'Not configured' },
          email: emailResult ? { prepared: true } : { prepared: false }
        }
      })
    };

  } catch (error) {
    console.error('Error processing quote request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to process quote request',
        details: error.message
      })
    };
  }
};
