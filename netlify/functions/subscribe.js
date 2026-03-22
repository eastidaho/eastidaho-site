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

    const url = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        email: email,
        reactivate_existing: true,
        send_welcome_email: true
      })
    });

    if (response.status === 200 || response.status === 201) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Successfully subscribed!' })
      };
    } else {
      const responseText = await response.text();
      console.error('Beehiiv API error:', response.status, responseText);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Subscription failed. Please try again.' })
      };
    }
  } catch (error) {
    console.error('Function error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Something went wrong. Please try again.' })
    };
  }
};
