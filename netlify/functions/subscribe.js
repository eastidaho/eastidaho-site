exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }) };
    }

    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
    const apiKey = process.env.BEEHIIV_API_KEY;

    // Debug logging
    console.log('Publication ID:', publicationId);
    console.log('API Key length:', apiKey ? apiKey.length : 'MISSING');
    console.log('API Key first 8 chars:', apiKey ? apiKey.substring(0, 8) : 'MISSING');
    console.log('API Key last 4 chars:', apiKey ? apiKey.slice(-4) : 'MISSING');
    console.log('Email:', email);

    const url = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`;
    console.log('Request URL:', url);

    const requestBody = {
      email: email,
      reactivate_existing: true,
      send_welcome_email: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);

    if (response.status === 200 || response.status === 201) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Successfully subscribed!' })
      };
    } else {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: responseText
      };
    }
  } catch (error) {
    console.error('Function error:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Something went wrong. Please try again.' })
    };
  }
};
