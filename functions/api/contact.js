export async function onRequestPost(context) {
  try {
    const { name, email, subject, message } = await context.request.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: 'Name, email, and message are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store in KV if available, otherwise just forward via email API
    // For now, we'll use a simple webhook approach
    // You can later connect this to an email service or KV store

    const contactEmail = context.env.CONTACT_EMAIL || 'hello@eastidaho.com';

    // If you have a Mailchannels or Resend API key, you can send email directly
    // For now, we'll store the submission and return success
    // The submissions will be logged in Cloudflare's function logs

    console.log('=== NEW CONTACT SUBMISSION ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject || 'No subject');
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('==============================');

    // Also subscribe them to Beehiiv if they submitted the contact form
    // (optional - remove if you don't want this)
    const publicationId = context.env.BEEHIIV_PUBLICATION_ID;
    const apiKey = context.env.BEEHIIV_API_KEY;

    if (publicationId && apiKey) {
      try {
        await fetch(
          `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              email: email,
              reactivate_existing: false,
              send_welcome_email: false
            })
          }
        );
      } catch (e) {
        // Silently fail - contact form is more important
      }
    }

    return new Response(
      JSON.stringify({ message: 'Message sent! We\'ll get back to you soon.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact function error:', error.message);
    return new Response(
      JSON.stringify({ message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
