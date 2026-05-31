#!/usr/bin/env node
// Polls DIRECT_URL until Postgres accepts a connection (used by `npm run db:reset`).
import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;
const connectionString = process.env.DIRECT_URL;
const deadline = Date.now() + 60_000;

while (Date.now() < deadline) {
  try {
    const client = new Client({ connectionString });
    await client.connect();
    await client.query('select 1');
    await client.end();
    console.log('✔ database ready');
    process.exit(0);
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

console.error('✖ database not ready after 60s');
process.exit(1);
