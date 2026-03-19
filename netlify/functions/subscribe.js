// ═══════════════════════════════════════════════════════
// BUREAU STAR RATING QUIZ — MAILERLITE SUBSCRIBE FUNCTION
// Netlify serverless function: netlify/functions/subscribe.js
// ═══════════════════════════════════════════════════════

// <!-- API key is read from the MAILERLITE_API_KEY environment variable.
//      Set this in your Netlify dashboard under Site Settings → Environment Variables.
//      Never hardcode the API key here. -->

const MAILERLITE_API = "https://connect.mailerlite.com/api/subscribers";

// Group IDs keyed as strings to match normalized rating lookup
const GROUP_IDS = {
  "1": "182345119231378577",
  "3": "182345222961759295",
  "5": "182345235309790815"
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: "Method not allowed" })
    };
  }

  // Read API key from environment — never hardcoded
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: "Server configuration error: missing API key" })
    };
  }

  let name, email, rating, optedIn;
  try {
    ({ name, email, rating, opted_in: optedIn } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: "Invalid JSON body" })
    };
  }

  // Normalize rating to string for reliable lookup — handles both number and string inputs
  const ratingKey = String(parseInt(rating, 10));

  console.log("[subscribe] Received payload:", { name, email, rating, ratingKey, optedIn });

  const groupId = GROUP_IDS[ratingKey];

  if (!name || !email || !groupId) {
    console.log("[subscribe] Validation failed — missing or invalid fields:", { name, email, ratingKey, groupId });
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: "Missing or invalid fields: name, email, and rating (1, 3, or 5) are required" })
    };
  }

  console.log("[subscribe] Group selected:", { ratingKey, groupId });

  const firstName = name.split(" ")[0];

  const payload = {
    email,
    fields: {
      name: firstName,
      opted_in: optedIn === false ? false : true
    },
    groups: [groupId]
  };

  console.log("[subscribe] Sending to MailerLite API:", JSON.stringify(payload));

  try {
    const response = await fetch(MAILERLITE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log("[subscribe] MailerLite API response status:", response.status, "| body:", JSON.stringify(data));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: data.message || "MailerLite API error" })
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.log("[subscribe] Fetch error:", err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: err.message || "Unexpected server error" })
    };
  }
};
