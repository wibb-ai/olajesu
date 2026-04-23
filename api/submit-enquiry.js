export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ success: false, message: 'Server form key is not configured' });
  }

  const {
    name = '',
    email = '',
    phone = '',
    event = '',
    guests = '',
    date = '',
    message = '',
    turnstileToken = '',
    honeypot = '',
  } = req.body || {};

  if (honeypot) {
    return res.status(400).json({ success: false, message: 'Submission blocked' });
  }

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  try {
    const fd = new FormData();
    fd.append('access_key', accessKey);
    fd.append('name', String(name));
    fd.append('email', String(email));
    fd.append('botcheck', '');
    if (turnstileToken) fd.append('cf-turnstile-response', String(turnstileToken));
    if (phone) fd.append('phone', String(phone));
    if (event) fd.append('event_type', String(event));
    if (guests) fd.append('guest_count', String(guests));
    if (date) fd.append('event_date', String(date));
    if (message) fd.append('message', String(message));

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: fd,
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(502).json({
        success: false,
        message: data?.message || 'Failed to submit',
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('submit-enquiry API error:', error);
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
}
