// Netlify Function to send booking SMS notification via Plivo
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

    // Create SMS message
    const smsMessage = `🔔 NEW BOOKING ALERT!

Customer: ${firstName} ${surname}
Mobile: ${mobile}
Email: ${email}
Address: ${address}, ${postCode}
Service: ${service}
Scheduled: ${formattedDate}

Please contact customer to confirm.`;

    // Business phone number to receive SMS (international format)
    const businessPhone = '+447424185232';

    // Plivo credentials from environment variables
    const PLIVO_AUTH_ID = process.env.PLIVO_AUTH_ID;
    const PLIVO_AUTH_TOKEN = process.env.PLIVO_AUTH_TOKEN;
    const PLIVO_PHONE_NUMBER = process.env.PLIVO_PHONE_NUMBER;

    // Check if Plivo credentials are configured
    if (!PLIVO_AUTH_ID || !PLIVO_AUTH_TOKEN || !PLIVO_PHONE_NUMBER) {
      console.log('Plivo not configured. Booking data:', bookingData);
      console.log('SMS would be sent to:', businessPhone);
      console.log('Message:', smsMessage);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Booking received (SMS not configured)',
          bookingData
        })
      };
    }

    // Prepare Plivo API request
    const auth = Buffer.from(`${PLIVO_AUTH_ID}:${PLIVO_AUTH_TOKEN}`).toString('base64');
    
    const postData = JSON.stringify({
      src: PLIVO_PHONE_NUMBER,
      dst: businessPhone,
      text: smsMessage
    });

    const options = {
      hostname: 'api.plivo.com',
      port: 443,
      path: `/v1/Account/${PLIVO_AUTH_ID}/Message/`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Send SMS via Plivo API
    const smsResult = await new Promise((resolve, reject) => {
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
            reject(new Error(`Plivo API error: ${res.statusCode} - ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });

    console.log('SMS sent successfully via Plivo:', smsResult);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Booking confirmed and SMS sent',
        messageId: smsResult.message_uuid?.[0] || smsResult.message_uuid
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
