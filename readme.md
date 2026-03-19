# @kszongic/jwt-inspect-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/jwt-inspect-cli)](https://www.npmjs.com/package/@kszongic/jwt-inspect-cli)
[![npm downloads](https://img.shields.io/npm/dm/@kszongic/jwt-inspect-cli)](https://www.npmjs.com/package/@kszongic/jwt-inspect-cli)
[![license](https://img.shields.io/npm/l/@kszongic/jwt-inspect-cli)](./LICENSE)
![node](https://img.shields.io/node/v/@kszongic/jwt-inspect-cli)
![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)
![cross-platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-lightgrey)

> Decode and inspect JWT tokens from the command line - header, payload, expiry, all in one shot. **Zero dependencies.**

```
$ jwt-inspect eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjE2MjM5MDIyfQ.xxx

  Header   { "alg": "HS256" }
  Payload  { "sub": "1234567890", "exp": 1616239022 }
  Expiry   expired 1826d ago (2021-03-20T09:17:02.000Z)
```

## Why?

- **No browser needed** - stop pasting tokens into jwt.io (and leaking them to a website)
- **Pipe-friendly** - chain with `curl`, `jq`, or your auth scripts
- **Expiry at a glance** - instantly see if a token is still valid
- **Zero dependencies** - installs in under a second

## Install

```bash
npm install -g @kszongic/jwt-inspect-cli
```

Or run without installing:

```bash
npx @kszongic/jwt-inspect-cli <token>
```

## Usage

```bash
# Inspect a full token
jwt-inspect eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

# Pipe from clipboard or other commands
echo $TOKEN | jwt-inspect

# Show only header
jwt-inspect $TOKEN --header

# Show only payload
jwt-inspect $TOKEN --payload

# Show only expiry info
jwt-inspect $TOKEN --expiry

# Raw JSON output (single line, good for piping)
jwt-inspect $TOKEN --raw
```

## Example Output

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "1234567890",
    "name": "John Doe",
    "exp": 1616239022
  },
  "expiry": {
    "timestamp": 1616239022,
    "date": "2021-03-20T09:17:02.000Z",
    "expired": true,
    "relative": "expired 1826d 3h ago"
  },
  "signature": "SflKxwRJSMeKKF2QT4fw..."
}
```

## Options

| Flag | Description |
|------|-------------|
| `-h, --header` | Show only the decoded header |
| `-p, --payload` | Show only the decoded payload |
| `-e, --expiry` | Show only expiry information |
| `-r, --raw` | Output raw JSON (no indentation) |
| `--help` | Show help |
| `--version` | Show version |

## Recipes

### Debug an API response inline

```bash
curl -s https://api.example.com/login \
  -d '{"user":"me","pass":"secret"}' \
  | jq -r '.token' \
  | jwt-inspect
```

### Check if a token is expired in CI

```bash
jwt-inspect "$CI_TOKEN" --expiry --raw | jq -e '.expired == false' || {
  echo "Token expired - rotating..."
  exit 1
}
```

### Decode tokens from log files

```bash
grep -oP 'Bearer \K[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' access.log \
  | while read t; do echo "---"; jwt-inspect "$t" --payload; done
```

### Compare two tokens side-by-side

```bash
diff <(jwt-inspect "$TOKEN_A" --payload --raw) \
     <(jwt-inspect "$TOKEN_B" --payload --raw)
```

### npm script for dev workflow

```json
{
  "scripts": {
    "token:check": "jwt-inspect $AUTH_TOKEN --expiry"
  }
}
```

## How It Works

JWTs are three Base64url-encoded segments separated by dots: `header.payload.signature`. This tool decodes the first two segments (no secret needed - JWTs are signed, not encrypted), parses the JSON, and if an `exp` claim exists, calculates whether the token has expired and how long ago (or until).

No verification is performed - this is an inspection tool, not a validation library. For signature verification, use a library like [jose](https://github.com/panva/jose).

## Comparison

| Feature | jwt-inspect-cli | jwt.io (web) | jose (library) | jwt-cli (Rust) |
|---------|:-:|:-:|:-:|:-:|
| CLI decode | Yes | No | No | Yes |
| Zero dependencies | Yes | - | No | Yes |
| Expiry check | Yes | No | Yes | Yes |
| Pipe-friendly | Yes | No | - | Yes |
| No browser/leak risk | Yes | No | Yes | Yes |
| Cross-platform (npm) | Yes | - | Yes | No |
| Install size | ~15 KB | - | ~200 KB | ~3 MB |

## Use Cases

- **API debugging** - decode tokens returned by auth endpoints
- **Security audits** - inspect tokens in logs without leaking to third-party websites
- **Token rotation** - CI scripts that check expiry before deployment
- **Code reviews** - quickly verify what claims a token carries
- **Testing** - compare tokens across environments

## Related Tools

- [`@kszongic/string-hash-cli`](https://www.npmjs.com/package/@kszongic/string-hash-cli) - Hash strings from the terminal
- [`@kszongic/base64-cli`](https://www.npmjs.com/package/@kszongic/base64-cli) - Encode/decode Base64
- [`@kszongic/checksum-verify-cli`](https://www.npmjs.com/package/@kszongic/checksum-verify-cli) - Verify file checksums
- [`@kszongic/env-lint-cli`](https://www.npmjs.com/package/@kszongic/env-lint-cli) - Validate .env files
- [`@kszongic/pwd-entropy-cli`](https://www.npmjs.com/package/@kszongic/pwd-entropy-cli) - Check password strength

## License

MIT (c) kszongic
