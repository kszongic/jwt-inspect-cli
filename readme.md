# @kszongic/jwt-inspect-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/jwt-inspect-cli)](https://www.npmjs.com/package/@kszongic/jwt-inspect-cli)
[![license](https://img.shields.io/npm/l/@kszongic/jwt-inspect-cli)](./LICENSE)

Inspect JWT tokens from the command line — decode header, payload, and check expiry. **Zero dependencies.**

## Install

```bash
npm install -g @kszongic/jwt-inspect-cli
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

## License

MIT © kszongic
