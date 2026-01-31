// Netlify Function to send quote request SMS notification
// This function will be called when a customer submits a quote request

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    // Parse the quote request data from the request
    const quoteData = JSON.parse(event.body)
    
    const {
      firstName,
      lastName,
      email,
      phone,
      service,
      message
    } = quoteData

    // Create SMS message
    const smsMessage = `🔔 NEW QUOTE REQUEST!

Customer: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}
Service: ${service}
Message: ${message}

Please contact customer within 24 hours.`

    // Business phone number to receive SMS (international format)
    const businessPhone = '+447424185232'

    // For now, we'll use Twilio as the SMS provider
    // You'll need to set up Twilio account and add environment variables:
    // TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
    
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    // Check if Twilio credentials are configured
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('Twilio not configured. Quote data:', quoteData)
      
      // For testing: log the quote and return success
      // In production, this should fail if SMS can't be sent
      console.log('SMS would be sent to:', businessPhone)
      console.log('Message:', smsMessage)
      
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
      }
    }

    // Send SMS using Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: businessPhone,
        From: twilioPhoneNumber,
        Body: smsMessage
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio error:', error)
      throw new Error('Failed to send SMS')
    }

    const result = await response.json()
    console.log('SMS sent successfully:', result.sid)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Quote request confirmed and SMS sent',
        messageSid: result.sid
      })
    }

  } catch (error) {
    console.error('Error processing quote request:', error)
    
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
    }
  }
}
