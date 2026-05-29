# Personal Website

Vite-powered personal website.

## Run With Docker

Build and start the production container:

```bash
docker compose up --build
```

Open the site on this computer:

```text
http://localhost:8080
```

To test from another device on the same Wi-Fi/LAN:

1. Find this computer's local IP address.
   - Linux: `hostname -I`
   - macOS: `ipconfig getifaddr en0`
   - Windows: `ipconfig`
2. Open this URL on the other device, replacing the IP:

```text
http://YOUR_LOCAL_IP:8080
```

Stop the container:

```bash
docker compose down
```

## Run Without Docker

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Build Check

```bash
npm run check
```
