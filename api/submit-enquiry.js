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
    inAppBrowser = false,
  } = req.body || {};

  if (honeypot) {
    return res.status(400).json({ success: false, message: 'Submission blocked' });
  }

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const postToWeb3Forms = async ({ includeTurnstile }) => {
    const payload = {
      access_key: accessKey,
      name: String(name),
      email: String(email),
      botcheck: '',
      ...(includeTurnstile && turnstileToken ? { 'cf-turnstile-response': String(turnstileToken) } : {}),
      ...(phone ? { phone: String(phone) } : {}),
      ...(event ? { event_type: String(event) } : {}),
      ...(guests ? { guest_count: String(guests) } : {}),
      ...(date ? { event_date: String(date) } : {}),
      ...(message ? { message: String(message) } : {}),
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { success: false, message: 'Invalid response from forms provider' };
    }

    return { response, data };
  };

  try {
    let { response, data } = await postToWeb3Forms({ includeTurnstile: true });

    const likelyCaptchaIssue =
      !response.ok ||
      !data?.success
        ? /turnstile|captcha|verification/i.test(String(data?.message || ''))
        : false;

    if ((inAppBrowser || req.headers['user-agent']?.includes('Instagram')) && likelyCaptchaIssue) {
      ({ response, data } = await postToWeb3Forms({ includeTurnstile: false }));
    }

    if (!response.ok || !data.success) {
      return res.status(502).json({
        success: false,
        message: data?.message || 'Failed to submit. Please open in browser or contact via WhatsApp.',
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('submit-enquiry API error:', error);
    return res.status(500).json({ success: false, message: 'Unexpected server error. Check WEB3FORMS_ACCESS_KEY in Vercel.' });
  }
}
