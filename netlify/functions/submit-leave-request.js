exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z2ZvbndnZW9pZXZneHd2eGxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzOTgwNCwiZXhwIjoyMDkxNDE1ODA0fQ.yzHKNyoZ85hj2xxjW_byLStr-O9FOCPna9OVXvzthWI';

  try {
    const d = JSON.parse(event.body);

    // Server-side maintenance gate: refuse new submissions while maintenance mode is on,
    // so the lock holds even for a page that was already open when it was switched on.
    try {
      const ms = await fetch('https://kwgfonwgeoievgxwvxlg.supabase.co/rest/v1/settings?id=eq.global&select=maintenance_mode', {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY }
      });
      if (ms.ok) {
        const rows = await ms.json();
        if (Array.isArray(rows) && rows[0] && rows[0].maintenance_mode === true) {
          return { statusCode: 503, headers: cors(), body: JSON.stringify({ success: false, error: 'Y-TRAK is in maintenance mode. Please try again shortly.' }) };
        }
      }
    } catch (e) { /* if the check fails, fall through and allow the submission */ }

    if (!d.leaveType || !Array.isArray(d.lines) || d.lines.length === 0) {
      return { statusCode: 400, headers: cors(), body: JSON.stringify({ success: false, error: 'Missing leave type or leave dates.' }) };
    }

    const res = await fetch('https://kwgfonwgeoievgxwvxlg.supabase.co/rest/v1/leave_requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        employee_name: d.name      || '',
        ssn_last4:     d.ssn       || '',
        leave_type:    d.leaveType || '',
        lines:         d.lines     || [],
        total_hours:   d.totalHours || '0.00',
        reason:        d.reason    || '',
        emp_signature: d.empSrc    || null,
        status:        'pending',
        submitted_at:  new Date().toISOString()
      })
    });

    const text = await res.text();
    console.log('Status:', res.status, 'Body:', text);

    if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + text);

    const rows = JSON.parse(text);
    const id = Array.isArray(rows) ? rows[0].id : rows.id;
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ success: true, id }) };

  } catch (e) {
    console.error('Error:', e.message);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ success: false, error: e.message }) };
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}
