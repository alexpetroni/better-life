#!/usr/bin/env tsx
// Right-to-erasure CLI.
//
//   npm run erase-lead -- <lead-uuid | email>
//
// Deletes the lead; ON DELETE CASCADE removes its quiz responses and consent
// records. Prints an auditable count of what was removed.
import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: npm run erase-lead -- <lead-uuid | email>');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  try {
    let leadId = arg;
    if (!UUID_RE.test(arg)) {
      const found = await client.query<{ id: string }>(
        'select id from app.leads where lower(email) = lower($1)',
        [arg]
      );
      if (found.rowCount === 0) {
        console.error(`✖ No lead found with email "${arg}".`);
        process.exit(1);
      }
      leadId = found.rows[0].id;
    }

    const res = await client.query<{
      deleted_lead: number;
      deleted_quiz_responses: number;
      deleted_consent_records: number;
    }>('select * from app.erase_lead($1)', [leadId]);

    const row = res.rows[0];
    if (!row || row.deleted_lead === 0) {
      console.error(`✖ No lead found with id "${leadId}".`);
      process.exit(1);
    }

    console.log(`✔ Erased lead ${leadId}`);
    console.log(`  • quiz_responses deleted:  ${row.deleted_quiz_responses}`);
    console.log(`  • consent_records deleted: ${row.deleted_consent_records}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('✖', err.message);
  process.exit(1);
});
