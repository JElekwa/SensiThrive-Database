#!/usr/bin/env node
// Import the guide into Supabase without the secret key landing in chat, files or shell history:
// asks for the URL and key (key hidden while typing), then runs supabase-push.mjs --with-overrides.
// usage: node scripts/supabase-import.mjs [project-url]
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); else if (!/[\r\n]/.test(s)) rl.output.write('*'.repeat(s.length)); };
    }
    rl.question(question, (a) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(a.trim()); });
  });
}

// Accept the API URL in any common shape (trailing /rest/v1/, no https://, capitals) or a dashboard
// link such as https://supabase.com/dashboard/project/<ref>/settings/api, and normalise it.
// The URL is not secret, so it may also be given on the command line: node scripts/supabase-import.mjs <url>
const raw = (process.argv[2] || (await ask('Supabase Project URL (https://xxxx.supabase.co): '))).replace(/^["']|["']$/g, '');
const low = raw.toLowerCase();
const ref = low.match(/(?:^|\/\/)([a-z0-9]{15,30})\.supabase\.co/)?.[1] || low.match(/(?:dashboard\/project\/|project_ref=)([a-z0-9]{15,30})/)?.[1];
if (!ref) {
  console.error(`Could not find a project in "${raw}". Copy the Project URL from Project Settings > Data API; it looks like https://abcdefghijklmnopqrst.supabase.co`);
  process.exit(1);
}
const url = `https://${ref}.supabase.co`;
console.log(`Using ${url}`);
const key = await ask('Secret key (sb_secret_... or service_role; hidden): ', { hidden: true });
if (!/^(sb_secret_|eyJ)/.test(key)) {
  console.error('That does not look like a secret key. Use the sb_secret_... key (or the legacy service_role key), not the publishable/anon one.');
  process.exit(1);
}
// --use-system-ca: trust the Windows certificate store too, so HTTPS still verifies on PCs where
// antivirus (e.g. Norton Web/Mail Shield) re-signs connections with its own installed root.
const child = spawn(process.execPath, ['--use-system-ca', path.join(ROOT, 'scripts/supabase-push.mjs'), '--with-overrides'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key },
});
child.on('exit', (code) => process.exit(code ?? 1));
