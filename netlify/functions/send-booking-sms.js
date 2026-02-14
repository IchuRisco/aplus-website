// Netlify Function to send booking SMS notification via MessageBird
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

    // MessageBird credentials from environment variables
    const MESSAGEBIRD_API_KEY = process.env.MESSAGEBIRD_API_KEY;

    // Check if MessageBird credentials are configured
    if (!MESSAGEBIRD_API_KEY) {
      console.log('MessageBird not configured. Booking data:', bookingData);
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

    // Prepare MessageBird API request
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

    // Send SMS via MessageBird API
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Booking confirmed and SMS sent',
        messageId: smsResult.id
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
