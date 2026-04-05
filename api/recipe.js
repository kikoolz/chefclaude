const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

function parseRequestBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function getErrorMessage(data, response) {
  return (
    data?.error?.message ||
    data?.error ||
    (typeof data === "string" && data.trim()) ||
    `API Error: ${response.status} - ${response.statusText}`
  );
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed." });
    }

    const token = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;

    if (!token) {
      return res.status(500).json({
        error: "Missing HF_API_KEY or HUGGINGFACE_API_KEY on the server.",
      });
    }

    const body = parseRequestBody(req.body);
    const {
      messages = [],
      max_tokens = 512,
      temperature = 0.7,
      models = [],
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing request messages." });
    }

    if (!Array.isArray(models) || models.length === 0) {
      return res.status(400).json({ error: "Missing model candidates." });
    }

    let lastError = "No supported model was available.";

    for (const model of models) {
      try {
        const response = await fetch(HF_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens,
            temperature,
          }),
        });

        const rawBody = await response.text();
        let data = null;

        try {
          data = rawBody ? JSON.parse(rawBody) : null;
        } catch {
          data = rawBody;
        }

        if (!response.ok) {
          lastError = getErrorMessage(data, response);
          continue;
        }

        return res.status(200).json(data);
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : "Unknown fetch error.";
      }
    }

    return res.status(502).json({ error: lastError });
  } catch (error) {
    console.error("Recipe API crashed:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unexpected server error in recipe API.",
    });
  }
}
