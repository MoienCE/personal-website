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

## TODOs
> loading: add a loading scene with a loading icon and a stylized dialogues box to tell the user what asset is being loaded now (P1)

> performance: most of the problems and fps drops are because of animations (P1)

> navigation buttons should not hide in mobile (P1)

> refactor: remove unused codes and clear css (P3)

> only scroll description while the text is not fit in the border

> in phone, lower the gap between points

> hardly remove all hovering functionalities in mobile including hovering points in timeline and navigation buttons 

> minors are so much like majors. we need to build a difference between minor cards and major cards. also on the timeline we need to show that the minors are related to the major before them

> sometimes scrolling stops after scroling into another session and I should move the mouse so I can continue scrolling

> add an animation for the transition between two points in timeline (just a simple fade in fade out for the points is okay)

> being able to click on the media in timeline cards and open them in a simple pop up with a back button