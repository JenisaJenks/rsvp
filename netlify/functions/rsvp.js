// RSVP → Notion (Netlify serverless function).
// Receives the RSVP form POST and creates one row in the Notion database,
// keeping the Notion token server-side. Required environment variables:
//   NOTION_TOKEN       – secret from the Notion internal integration
//   NOTION_DATABASE_ID – the RSVP database id

const NOTION_API = "https://api.notion.com/v1/pages";
const NOTION_VERSION = "2022-06-28";
const ATTENDANCE_OPTIONS = ["Joyfully Accepts", "Regretfully Declines"];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" }, { Allow: "POST" });
  }

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    return json(500, { error: "Server is not configured." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const name = String(body.name || "").trim();
  const attendance = String(body.attendance || "").trim();
  const dietary = String(body.dietary || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !ATTENDANCE_OPTIONS.includes(attendance)) {
    return json(400, { error: "Please provide your name and attendance." });
  }

  const properties = {
    Name: { title: [{ text: { content: name.slice(0, 200) } }] },
    Attendance: { select: { name: attendance } },
  };
  if (dietary) {
    properties["Dietary Requirements"] = {
      rich_text: [{ text: { content: dietary.slice(0, 2000) } }],
    };
  }
  if (message) {
    properties.Message = {
      rich_text: [{ text: { content: message.slice(0, 2000) } }],
    };
  }

  const res = await fetch(NOTION_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Notion API error:", res.status, detail);
    return json(502, { error: "Could not save your RSVP. Please try again." });
  }

  return json(200, { ok: true });
};

function json(statusCode, data, extraHeaders) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(data),
  };
}
