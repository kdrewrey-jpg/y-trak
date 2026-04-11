exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { id, supervisor_name, supervisor_email, dep_signature } = JSON.parse(event.body);

    const updateData = {
      status:            'approved',
      approved_at:       new Date().toISOString(),
      approved_by_name:  supervisor_name  || '',
      approved_by_email: supervisor_email || ''
    };
    if (dep_signature) updateData.dep_signature = dep_signature;

    const res = await fetch(`https://kwgfonwgeoievgxwvxlg.supabase.co/rest/v1/timesheets?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z2ZvbndnZW9pZXZneHd2eGxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzOTgwNCwiZXhwIjoyMDkxNDE1ODA0fQ.yzHKNyoZ85hj2xxjW_byLStr-O9FOCPna9OVXvzthWI',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z2ZvbndnZW9pZXZneHd2eGxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzOTgwNCwiZXhwIjoyMDkxNDE1ODA0fQ.yzHKNyoZ85hj2xxjW_byLStr-O9FOCPna9OVXvzthWI',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updateData)
    });

    const text = await res.text();
    console.log('Approve status:', res.status, 'Body:', text);
    if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + text);

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ success: true }) };

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
