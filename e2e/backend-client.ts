import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv({ path: 'e2e/.env' });

const BACKEND_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let cachedToken: string | null = null;

/** Direct backend/Supabase calls for test setup and teardown - not exercising the UI, just fixture management. */
export async function getAdminToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) {
    throw new Error(`Failed to get admin token for test setup: ${data.error_description ?? JSON.stringify(data)}`);
  }
  cachedToken = data.access_token;
  return cachedToken;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAdminToken();
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
}

export async function createTestClient(clientId: string, clientName: string) {
  const res = await apiFetch('/clients', { method: 'POST', body: JSON.stringify({ clientId, clientName }) });
  if (!res.ok) throw new Error(`Failed to create test client: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function createTestSite(clientCode: string, businessName: string) {
  const res = await apiFetch(`/clients/${clientCode}/sites`, {
    method: 'POST',
    body: JSON.stringify({ businessName, address: '123 Test St' }),
  });
  if (!res.ok) throw new Error(`Failed to create test site: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Full real pipeline: request a signature, upload a real 1x1 PNG directly to Cloudinary, submit feedback referencing it. Mirrors exactly what the public form does, just via fetch instead of the browser. */
export async function submitFeedbackWithRealAttachment(slug: string, feedbackText: string): Promise<{ feedbackId: string }> {
  const sigRes = await fetch('http://localhost:3000/uploads/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: `test/e2e-${Date.now()}` }),
  });
  const sig = (await sigRes.json()) as {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    allowedFormats: string;
  };

  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  );
  const form = new FormData();
  form.append('file', new Blob([pngBytes]), 'e2e-test.png');
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);
  form.append('allowed_formats', sig.allowedFormats);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const uploaded = (await uploadRes.json()) as { public_id?: string; error?: { message: string } };
  if (!uploaded.public_id) {
    throw new Error(`Direct Cloudinary upload failed in test setup: ${uploaded.error?.message}`);
  }

  const feedbackRes = await fetch(`http://localhost:3000/feedback/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      feedback: feedbackText,
      media: [
        {
          cloudinaryPublicId: uploaded.public_id,
          resourceType: 'IMAGE',
          originalFilename: 'e2e-test.png',
          mimeType: 'image/png',
          sizeBytes: pngBytes.length,
        },
      ],
    }),
  });
  const feedbackBody = await feedbackRes.json();
  if (!feedbackRes.ok) {
    throw new Error(`Test feedback submission failed: ${JSON.stringify(feedbackBody)}`);
  }
  return { feedbackId: feedbackBody.id };
}

/** Hard-deletes if possible; falls back to deactivating if it has feedback history (ON DELETE RESTRICT). */
export async function deleteTestClient(clientCode: string) {
  const res = await apiFetch(`/clients/${clientCode}`, { method: 'DELETE' });
  if (res.status === 409) {
    await apiFetch(`/clients/${clientCode}`, { method: 'PUT', body: JSON.stringify({ status: 'INACTIVE' }) });
  } else if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to clean up test client ${clientCode}: ${res.status} ${await res.text()}`);
  }
}
