const SYSTEM_PROMPT = `
You are Chef Hugh, a friendly home cook.
The user gives you ingredients they already have. Suggest one practical recipe using some or all of them.
You can add a few extra ingredients when needed, but keep extras minimal.

Use this markdown structure:
## Recipe Name
<short recipe name>
## Ingredients
- ingredient 1
- ingredient 2
## Instructions
1. step 1
2. step 2

Write in a natural, warm, and clear tone.
Keep it concise and easy to follow.
Use a bullet list for ingredients and a numbered list for instructions.
Do not add introductions, notes, tips, or any extra sections.

Keep extra ingredients to 5 or fewer unless absolutely necessary.
`

const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
const CHAT_COMPLETIONS_URL = "https://router.huggingface.co/v1/chat/completions"

function getAllowedOrigins() {
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : []

  return new Set(["http://localhost:5173", "http://localhost:4173", ...configuredOrigins])
}

function applyCorsHeaders(req, res) {
  const requestOrigin = req.headers.origin
  const allowedOrigins = getAllowedOrigins()

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin)
    res.setHeader("Vary", "Origin")
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function parseRequestBody(body) {
  if (!body) return {}
  if (typeof body === "string") {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }

  return body
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res)

  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const token = process.env.HF_ACCESS_TOKEN
  if (!token) {
    return res.status(500).json({ error: "Missing HF_ACCESS_TOKEN in server environment" })
  }

  const body = parseRequestBody(req.body)
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients : []

  if (ingredients.length === 0) {
    return res.status(400).json({ error: "Ingredients are required" })
  }

  const ingredientsString = ingredients.join(", ")

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `I have ${ingredientsString}. Give me one recipe and return only valid markdown with exactly these sections: Recipe Name, Ingredients, Instructions.`
            }
          ],
          temperature: 0.3,
          top_p: 0.85,
          max_tokens: 450
        })
      })

      const rawBody = await response.text()
      let data = null

      try {
        data = rawBody ? JSON.parse(rawBody) : null
      } catch {
        data = null
      }

      if (response.ok) {
        const recipeMarkdown = (data?.choices?.[0]?.message?.content || "").trim()

        return res.status(200).json({
          recipeMarkdown: recipeMarkdown || [
            "## Recipe Name",
            "Chef Hugh Special",
            "",
            "## Ingredients",
            "- Ingredients not provided",
            "",
            "## Instructions",
            "1. Instructions not provided"
          ].join("\n")
        })
      }

      const retryable = response.status === 429 || response.status === 503
      if (retryable && attempt < 2) {
        await sleep(1800)
        continue
      }

      const errorMessage = typeof data?.error === "string"
        ? data.error
        : (rawBody || `Failed to fetch recipe from Hugging Face (status ${response.status})`)
      return res.status(response.status || 500).json({ error: errorMessage })
    } catch {
      if (attempt < 2) {
        await sleep(1200)
        continue
      }

      return res.status(500).json({ error: "Recipe generation failed" })
    }
  }

  return res.status(500).json({ error: "Recipe generation failed" })
}