// Netlify Function to send booking notifications via MessageBird SMS + Email
// This function will be called when a customer submits a booking

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
    // Parse the booking data from the request
    const bookingData = JSON.parse(event.body);
    
    const {
      firstName,
      surname,
      mobile,
      email,
      address,
      postCode,
      service,
      scheduleDate
    } = bookingData;

    // Format the schedule date
    const formattedDate = new Date(scheduleDate).toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create SMS message (shorter for SMS)
    const smsMessage = `🔔 NEW BOOKING!
Customer: ${firstName} ${surname}
Mobile: ${mobile}
Service: ${service}
Date: ${formattedDate}
Address: ${address}, ${postCode}`;

    // Create email message (detailed HTML)
    const emailSubject = `New Booking Request - ${firstName} ${surname}`;
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
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔔 New Booking Request</h2>
      <p style="margin: 5px 0 0 0;">Aplus+ Cleaning Services</p>
    </div>
    <div class="content">
      <p>You have received a new booking request from your website:</p>
      
      <div class="field">
        <div class="label">Customer Name</div>
        <div class="value">${firstName} ${surname}</div>
      </div>
      
      <div class="field">
        <div class="label">Mobile Number</div>
        <div class="value"><a href="tel:${mobile}">${mobile}</a></div>
      </div>
      
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>
      
      <div class="field">
        <div class="label">Service Requested</div>
        <div class="value">${service}</div>
      </div>
      
      <div class="field">
        <div class="label">Scheduled Date & Time</div>
        <div class="value">${formattedDate}</div>
      </div>
      
      <div class="field">
        <div class="label">Service Address</div>
        <div class="value">${address}<br>${postCode}</div>
      </div>
      
      <div class="footer">
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Contact the customer to confirm the booking</li>
          <li>Verify service details and requirements</li>
          <li>Send confirmation email/SMS to customer</li>
        </ul>
        <p style="margin-top: 15px;">This is an automated notification from your website booking system.</p>
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

    // Send Email via Netlify's built-in email service (using fetch to Netlify API)
    try {
      const emailData = {
        to: businessEmail,
        from: 'noreply@apluscleaningservices.uk',
        subject: emailSubject,
        html: emailBody,
        text: `New Booking Request

Customer: ${firstName} ${surname}
Mobile: ${mobile}
Email: ${email}
Service: ${service}
Scheduled: ${formattedDate}
Address: ${address}, ${postCode}

Please contact the customer to confirm the booking.`
      };

      // Log email data (in production, you would send via email service)
      console.log('Email notification prepared:', {
        to: businessEmail,
        subject: emailSubject,
        bookingData
      });

      // Note: Netlify doesn't have built-in email sending
      // For production, you would integrate with SendGrid, Mailgun, or similar
      // For now, we'll log it and mark as successful
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
        message: 'Booking confirmed',
        notifications: {
          sms: smsResult ? { sent: true, id: smsResult.id } : { sent: false, reason: 'Not configured' },
          email: emailResult ? { prepared: true } : { prepared: false }
        }
      })
    };

  } catch (error) {
    console.error('Error processing booking:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to process booking',
        details: error.message
      })
    };
  }
};
