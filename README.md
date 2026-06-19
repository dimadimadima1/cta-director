# CTA Director

Drop a website screenshot or product image and get a production-ready **OpenAI Flow** prompt — with an AI-written copy draft, a live layout builder, switchable visual styles and layout compositions, and a one-click copyable prompt.

Built as a single React component (`src/CTABuilder.jsx`).

---

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## Build

```bash
npm run build      # outputs to /dist
npm run preview    # serve the production build locally
```

---

## Project structure

```
.
├── index.html          # Vite entry, loads Tailwind Play CDN + /main.jsx
├── main.jsx            # React root, renders <CTADirector />
├── CTABuilder.jsx      # the entire app (component)
├── package.json
└── vite.config.js      # @vitejs/plugin-react
```

Tailwind is loaded via the Play CDN in `index.html` purely for the handful of
utility classes the component uses (`flex`, `grid`, `items-center`, …). Everything
else is inline styling, so there is no PostCSS/Tailwind build config to maintain.

---

## Deploy on Render

**Option A — Static Site (recommended)**

- New → **Static Site**, connect this repo.
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`

**Option B — Web Service**

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run preview`  (it binds to `0.0.0.0` and Render's `$PORT`)

Either way the build is a standard Vite SPA.

---

## A note on the AI features

The app calls the Anthropic Messages API directly from the browser
(`https://api.anthropic.com/v1/messages`) for screenshot analysis and the
per-field “Regenerate” actions.

- Inside the **Claude artifact environment**, the API key is injected automatically, so analysis and regeneration work out of the box.
- When deployed **standalone** (Render, Vercel, etc.), that direct browser call will not succeed (no key is present and the endpoint isn’t CORS-open to browsers). No key is bundled in the source, so nothing sensitive is exposed.
- The UI is designed to **fail gracefully**: if analysis can’t run, it samples brand colors from the image and lets you fill the copy fields yourself, then everything downstream (layout builder, style/inspiration switching, prompt generation, copy) works entirely client-side.

To make the AI features work on a standalone deploy, add a small backend proxy
that holds your `ANTHROPIC_API_KEY` and forwards requests to the Anthropic API,
then point the component’s `fetch` calls at that proxy. (Not included here.)

---

_by Dima_
