export async function onRequestPost(context) {
  try {
    const { email } = await context.request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ message: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const publicationId = context.env.BEEHIIV_PUBLICATION_ID;
    const apiKey = context.env.BEEHIIV_API_KEY;

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
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
      }
    );

    if (response.status === 200 || response.status === 201) {
      return new Response(
        JSON.stringify({ message: 'Successfully subscribed!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await response.text();
      console.error('Beehiiv API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ message: 'Subscription failed. Please try again.' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Function error:', error.message);
    return new Response(
      JSON.stringify({ message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
