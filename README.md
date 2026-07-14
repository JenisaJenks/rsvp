# Save the Date — Josh & Jenisa

A single-page "save the date" with an envelope-opening animation and an
**RSVP form that saves responses to a Notion database**.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Envelope (page 1) → invitation (page 2) → RSVP (page 3) |
| `styles.css` | All styling |
| `script.js` | Envelope animation, page navigation, RSVP form submit |
| `netlify/functions/rsvp.js` | Serverless function that writes RSVPs to Notion |
| `netlify.toml` | Netlify build/functions config |
| `lace.png`, `Seal.png` | Envelope artwork |

## How the RSVP works

The browser **cannot** talk to Notion directly (the API token would be exposed,
and Notion blocks cross-origin browser calls). So:

```
Guest submits form → /.netlify/functions/rsvp → Notion API → new row in the database
```

The Notion token lives only in the serverless function's environment variables.

## One-time setup

1. **Create a Notion integration**
   - Go to <https://www.notion.so/my-integrations> → **New integration**.
   - Name it (e.g. "Wedding RSVP"), pick the "Momo's Space" workspace, create it.
   - Copy the **Internal Integration Secret** (starts with `ntn_` or `secret_`).

2. **Give the integration access to the database**
   - Open the **💒 Wedding RSVPs — Jenisa & Josh** database in Notion.
   - Top-right `•••` menu → **Connections** → add your integration.

3. **Get the database ID**
   - It's the 32-character id in the database URL:
     `https://www.notion.so/…/151c68dd7d46474ca39e338339bb54cb?…`
     → `151c68dd7d46474ca39e338339bb54cb`
   - (This project's database ID is `151c68dd-7d46-474c-a39e-338339bb54cb`.)

4. **Deploy to Netlify**
   - Connect this repo in Netlify (or drag-and-drop the folder).
   - In **Site configuration → Environment variables**, add:
     - `NOTION_TOKEN` = the integration secret from step 1
     - `NOTION_DATABASE_ID` = the database ID from step 3
   - Deploy. Netlify auto-detects `netlify/functions`.

5. **Test** — open the site, click **Open the Invitation → RSVP**, submit, and
   confirm a new row appears in the Notion database.

## Database fields

The form maps to these columns (they must exist with these exact names):

- **Name** (title)
- **Attendance** (select: `Joyfully Accepts`, `Regretfully Declines`)
- **Dietary Requirements** (text)
- **Message** (text)
- **Submitted At** (created time — set automatically)

## Local preview

Static preview only (the RSVP submit needs Netlify's functions):

```
python -m http.server 5599
```

To test the function locally too, use the Netlify CLI: `netlify dev`.

## Changing the details

- **Names, date, location, RSVP-by date** — in `index.html` (page 2 markup).
