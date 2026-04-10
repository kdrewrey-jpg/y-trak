exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const d = JSON.parse(event.body);

    const res = await fetch('https://kwgfonwgeoievgxwvxlg.supabase.co/rest/v1/timesheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z2ZvbndnZW9pZXZneHd2eGxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzOTgwNCwiZXhwIjoyMDkxNDE1ODA0fQ.yzHKNyoZ85hj2xxjW_byLStr-O9FOCPna9OVXvzthWI',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z2ZvbndnZW9pZXZneHd2eGxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzOTgwNCwiZXhwIjoyMDkxNDE1ODA0fQ.yzHKNyoZ85hj2xxjW_byLStr-O9FOCPna9OVXvzthWI',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        employee_name:     d.name     || '',
        ssn_last4:         d.ssn      || '',
        employment_status: d.status   || '',
        month:             d.month    || '',
        year:              d.year     || '',
        total_hours:       d.totTotal || '0.00',
        comp_hours:        d.totComp  || '0.00',
        sick_hours:        d.totSick  || '0.00',
        emp_signature:     d.empSrc   || null,
        rows:              d.rows     || [],
        status:            'pending',
        submitted_at:      new Date().toISOString()
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
