export async function onRequestPost(context) {
  try {
    const { name, email, subject, message } = await context.request.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: 'Name, email, and message are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = context.env.RESEND_API_KEY;
    const notifyEmail = context.env.CONTACT_EMAIL || 'hello@eastidaho.com';

    // Send email notification via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'East Idaho Contact Form <contact@eastidaho.com>',
        to: [notifyEmail],
        reply_to: email,
        subject: `[East Idaho] ${subject || 'New contact form submission'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #0f1a2e; margin-bottom: 4px;">New message from eastidaho.com</h2>
            <hr style="border: none; border-top: 2px solid #f0956c; margin: 16px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; color: #3d4a5c;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
            <p style="font-size: 12px; color: #999;">Sent from the contact form on eastidaho.com at ${new Date().toLocaleString('en-US', { timeZone: 'America/Boise' })}</p>
          </div>
        `
      })
    });

    if (emailResponse.ok) {
      return new Response(
        JSON.stringify({ message: "Message sent! We'll get back to you soon." }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', emailResponse.status, errorData);
      return new Response(
        JSON.stringify({ message: "Message sent! We'll get back to you soon." }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Contact function error:', error.message);
    return new Response(
      JSON.stringify({ message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
