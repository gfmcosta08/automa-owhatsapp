'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL não definido');
    process.exit(1);
  }
  const needsSsl =
    url.includes('amazonaws.com') ||
    url.includes('render.com') ||
    process.env.PGSSLMODE === 'require';
  const client = new Client({ connectionString: url, ssl: needsSsl ? { rejectUnauthorized: false } : false });
  await client.connect();
  const sqlPath = path.join(__dirname, '..', '..', 'src', 'database', 'migrations', '001_initial.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client.query(sql);
  await client.end();
  console.log('Migração 001_initial.sql aplicada.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
