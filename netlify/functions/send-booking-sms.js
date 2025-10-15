// Netlify Function to send booking SMS notification
// This function will be called when a customer submits a booking

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    // Parse the booking data from the request
    const bookingData = JSON.parse(event.body)
    
    const {
      firstName,
      surname,
      mobile,
      email,
      address,
      postCode,
      service,
      scheduleDate
    } = bookingData

    // Format the schedule date
    const formattedDate = new Date(scheduleDate).toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Create SMS message
    const smsMessage = `🔔 NEW BOOKING ALERT!

Customer: ${firstName} ${surname}
Mobile: ${mobile}
Email: ${email}
Address: ${address}, ${postCode}
Service: ${service}
Scheduled: ${formattedDate}

Please contact customer to confirm.`

    // Business phone number to receive SMS
    const businessPhone = '07424185232'

    // For now, we'll use Twilio as the SMS provider
    // You'll need to set up Twilio account and add environment variables:
    // TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
    
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    // Check if Twilio credentials are configured
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('Twilio not configured. Booking data:', bookingData)
      
      // For testing: log the booking and return success
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
          message: 'Booking received (SMS not configured)',
          bookingData
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
        To: `+44${businessPhone.substring(1)}`, // Convert UK number to international format
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
        message: 'Booking confirmed and SMS sent',
        messageSid: result.sid
      })
    }

  } catch (error) {
    console.error('Error processing booking:', error)
    
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
    }
  }
}

