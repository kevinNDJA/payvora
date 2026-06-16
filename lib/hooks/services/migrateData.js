// Client-side migration helper: sends local invoices/settings to server /migrate endpoint
export async function migrateLocalDataToServer(session) {
  try {
    if (typeof window === 'undefined') return { error: 'no-window' };
    const token = session?.access_token;
    if (!token) return { error: 'no-session' };

    const migratedFlag = await window.storage.get('migrated_v1');
    if (migratedFlag) return { ok: true, skipped: true };

    const invEntry = await window.storage.get('invoices');
    const invoices = invEntry ? JSON.parse(invEntry.value) : [];
    const infoEntry = await window.storage.get('myInfo');
    const settings = infoEntry ? JSON.parse(infoEntry.value) : null;

    const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4242';
    const resp = await fetch(`${backend.replace(/\/$/, '')}/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoices, settings }),
    });

    const json = await resp.json();
    if (!resp.ok) return { error: json };

    await window.storage.set('migrated_v1', JSON.stringify({ migratedAt: Date.now(), summary: json }));
    return { ok: true, result: json };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
}

export default { migrateLocalDataToServer };
