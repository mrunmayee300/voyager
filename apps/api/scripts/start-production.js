/**
 * Production entry: migrate DB then start Express.
 * Requires DATABASE_URL on the host (Render → link Postgres to web service).
 */
const { execSync } = require('child_process');
const path = require('path');

const apiRoot = path.join(__dirname, '..');
const repoRoot = path.join(apiRoot, '../..');
const schemaPath = path.join(repoRoot, 'packages/database/prisma/schema.prisma');

if (!process.env.DATABASE_URL) {
  console.error('');
  console.error('ERROR: DATABASE_URL is not set.');
  console.error('');
  console.error('On Render:');
  console.error('  1. Open your API service → Environment');
  console.error('  2. Add DATABASE_URL = Internal Database URL from your Postgres instance');
  console.error('     (or redeploy with updated render.yaml that links voyager-db)');
  console.error('');
  process.exit(1);
}

console.log('Running Prisma migrations...');
execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
});

console.log('Starting Voyager API...');
execSync('node dist/main.js', {
  cwd: apiRoot,
  stdio: 'inherit',
  env: process.env,
});
