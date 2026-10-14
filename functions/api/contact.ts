// Cloudflare Pages Function: POST /api/contact
// Verifies Cloudflare Turnstile (if configured) and emails the message to the owner.
//
// Environment variables (Cloudflare Pages > Settings > Variables and Secrets):
//   TURNSTILE_SECRET  - Turnstile secret key (optional until Turnstile is set up)
//   RESEND_API_KEY    - API key for the email service (Resend is used here; see README for alternatives)
//   CONTACT_TO        - destination address, e.g. tyler@oakhearttech.com
//   CONTACT_FROM      - verified sender, e.g. "Oakheart Website <noreply@oakhearttech.com>"

interface Env {
  TURNSTILE_SECRET?: string;
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const form = await request.formData();
  const get = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot: bots fill this in. Pretend success.
  if (get('website')) return json({ ok: true });

  const name = get('name');
  const email = get('email');
  const message = get('message');
  if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Missing or invalid fields' }, 400);
  }
  if (message.length > 5000) return json({ ok: false, error: 'Message too long' }, 400);

  if (env.TURNSTILE_SECRET) {
    const token = get('cf-turnstile-response');
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') ?? '',
      }),
    });
    const result = (await check.json()) as { success?: boolean };
    if (!result.success) return json({ ok: false, error: 'Verification failed' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json({ ok: false, error: 'Email is not configured' }, 500);
  }

  const lines = [
    `Name: ${name}`,
    `Business: ${get('business')}`,
    `Email: ${email}`,
    `Phone: ${get('phone')}`,
    `Heard about Oakheart via: ${get('source')}`,
    '',
    message,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Website inquiry from ${name}`,
      text: lines,
    }),
  });
  if (!res.ok) return json({ ok: false, error: 'Could not send' }, 502);
  return json({ ok: true });
};
