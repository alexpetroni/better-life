#!/usr/bin/env node
// App-schema migration runner.
//
// Applies supabase/migrations/*.sql in lexical order against DIRECT_URL (the
// session/direct connection — never the transaction pooler), tracking applied
// files in app._migrations. Forward-only; safe to re-run (already-applied files
// are skipped). The files use Supabase CLI naming so the same migrations are
// managed by the Supabase CLI in production.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  console.error('✖ DIRECT_URL is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query('create schema if not exists app;');
    await client.query(`
      create table if not exists app._migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      );
    `);
    const appliedRows = await client.query('select name from app._migrations');
    const applied = new Set(appliedRows.rows.map((r) => r.name));

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      process.stdout.write(`→ applying ${file} ... `);
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into app._migrations (name) values ($1)', [file]);
        await client.query('commit');
        console.log('done');
        count += 1;
      } catch (err) {
        await client.query('rollback');
        console.log('FAILED');
        throw err;
      }
    }
    console.log(count ? `✔ applied ${count} app-schema migration(s)` : '✔ app schema already up to date');
    console.log('ℹ Payload manages its own schema (dev: auto-push on boot; prod: committed `payload migrate`).');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\n✖ migration failed:', err.message);
  process.exit(1);
});
