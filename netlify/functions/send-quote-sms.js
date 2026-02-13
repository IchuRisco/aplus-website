// Netlify Function to send quote request SMS notification via Plivo
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

    // Create SMS message
    const smsMessage = `🔔 NEW QUOTE REQUEST!

Customer: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}
Service: ${service}
Message: ${message}

Please contact customer within 24 hours.`;

    // Business phone number to receive SMS (international format)
    const businessPhone = '+447424185232';

    // Plivo credentials from environment variables
    const PLIVO_AUTH_ID = process.env.PLIVO_AUTH_ID;
    const PLIVO_AUTH_TOKEN = process.env.PLIVO_AUTH_TOKEN;
    const PLIVO_PHONE_NUMBER = process.env.PLIVO_PHONE_NUMBER;

    // Check if Plivo credentials are configured
    if (!PLIVO_AUTH_ID || !PLIVO_AUTH_TOKEN || !PLIVO_PHONE_NUMBER) {
      console.log('Plivo not configured. Quote data:', quoteData);
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
          message: 'Quote request received (SMS not configured)',
          quoteData
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
        message: 'Quote request confirmed and SMS sent',
        messageId: smsResult.message_uuid?.[0] || smsResult.message_uuid
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
