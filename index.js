#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);

function usage() {
  console.log(`Usage: jwt-inspect <token> [options]
       echo <token> | jwt-inspect [options]

Inspect a JWT token — decode header, payload, and check expiry.

Options:
  -h, --header     Show only the header
  -p, --payload    Show only the payload
  -e, --expiry     Show only the expiry info
  -r, --raw        Output raw JSON (no formatting)
  --help           Show this help message
  --version        Show version`);
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function parseJSON(str) {
  try { return JSON.parse(str); }
  catch { return null; }
}

function formatExpiry(exp) {
  if (!exp) return null;
  const d = new Date(exp * 1000);
  const now = Date.now();
  const diff = exp * 1000 - now;
  const expired = diff < 0;
  const abs = Math.abs(diff);
  const secs = Math.floor(abs / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  let relative;
  if (days > 0) relative = `${days}d ${hours % 24}h`;
  else if (hours > 0) relative = `${hours}h ${mins % 60}m`;
  else if (mins > 0) relative = `${mins}m ${secs % 60}s`;
  else relative = `${secs}s`;

  return {
    timestamp: exp,
    date: d.toISOString(),
    expired,
    relative: expired ? `expired ${relative} ago` : `expires in ${relative}`
  };
}

function inspect(token, opts) {
  token = token.trim();
  const parts = token.split('.');
  if (parts.length < 2 || parts.length > 3) {
    console.error('Error: Invalid JWT format (expected 2 or 3 dot-separated parts)');
    process.exit(1);
  }

  const header = parseJSON(base64UrlDecode(parts[0]));
  const payload = parseJSON(base64UrlDecode(parts[1]));

  if (!header) {
    console.error('Error: Could not decode JWT header');
    process.exit(1);
  }

  const fmt = opts.raw ? (o) => JSON.stringify(o) : (o) => JSON.stringify(o, null, 2);

  if (opts.headerOnly) {
    console.log(fmt(header));
    return;
  }

  if (opts.payloadOnly) {
    console.log(fmt(payload));
    return;
  }

  const expiry = payload ? formatExpiry(payload.exp) : null;

  if (opts.expiryOnly) {
    if (!expiry) {
      console.log('No exp claim found');
      process.exit(1);
    }
    console.log(fmt(expiry));
    return;
  }

  // Full output
  const result = { header, payload };
  if (expiry) result.expiry = expiry;
  result.signature = parts[2] ? (parts[2].length > 20 ? parts[2].substring(0, 20) + '...' : parts[2]) : '(none)';
  console.log(fmt(result));
}

function run(token) {
  const opts = {
    headerOnly: args.includes('-h') || args.includes('--header'),
    payloadOnly: args.includes('-p') || args.includes('--payload'),
    expiryOnly: args.includes('-e') || args.includes('--expiry'),
    raw: args.includes('-r') || args.includes('--raw')
  };
  inspect(token, opts);
}

if (args.includes('--help')) {
  usage();
  process.exit(0);
}

if (args.includes('--version')) {
  console.log(require('./package.json').version);
  process.exit(0);
}

// Find token from args (non-flag argument)
const tokenArg = args.find(a => !a.startsWith('-'));

if (tokenArg) {
  run(tokenArg);
} else if (!process.stdin.isTTY) {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => data += chunk);
  process.stdin.on('end', () => {
    if (!data.trim()) { usage(); process.exit(1); }
    run(data.trim());
  });
} else {
  usage();
  process.exit(1);
}
