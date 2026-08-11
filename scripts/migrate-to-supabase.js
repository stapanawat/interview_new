require('dotenv').config();

const fs = require('fs');
const path = require('path');

async function main() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.');

  const dataPath = path.join(__dirname, '../server/data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const response = await fetch(`${url}/rest/v1/app_state?on_conflict=id`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id: 1, data, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`Supabase import failed: ${response.status} ${await response.text()}`);
  console.log('Imported server/data.json into Supabase app_state.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
