import { normalizeRecipeResponse } from "./recipeGuardrails.js"

const SYSTEM_PROMPT = `
You are Chef Hugh, a friendly home cook.
The user gives you ingredients they already have. Suggest one practical recipe using some or all of them.
You can add a few extra ingredients when needed, but keep extras minimal.

Return only valid JSON with this exact shape:
{
  "recipeName": "short recipe name",
  "summary": "optional short summary",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"]
}

Write in a natural, warm, and clear tone.
Each instruction should be a complete, descriptive sentence that includes specific details like quantities, cook times, temperatures, and visual cues (e.g. "until golden brown").
Do not write vague one-liners like "Mix well and serve." — instead, explain how and why.
Aim for 5 to 8 detailed instruction steps.
Do not add introductions, notes, tips, markdown, or any keys other than recipeName, summary, ingredients, instructions.

Keep extra ingredients to 5 or fewer unless absolutely necessary.
`

const MODEL = "meta-llama/Llama-3.1-8B-Instruct"
const API_URL = "https://router.huggingface.co/v1/chat/completions"
const MAX_ATTEMPTS = 3

function allowedOrigins() {
  const extras = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []

  return new Set(["http://localhost:5173", "http://localhost:4173", ...extras])
}

function setCors(req, res) {
  const origin = req.headers.origin

  if (origin && allowedOrigins().has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function readBody(raw) {
  if (!raw) return {}
  if (typeof raw === "string") {
    try { return JSON.parse(raw) } catch { return {} }
  }
  return raw
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function askChefHugh(token, ingredientsList) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `I have ${ingredientsList}. Give me one recipe and return only valid JSON with keys recipeName, summary, ingredients, instructions.`
        }
      ],
      temperature: 0.3,
      top_p: 0.85,
      max_tokens: 700
    })
  })

  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* not JSON */ }

  return { response, data, text }
}

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === "OPTIONS") return res.status(204).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const token = process.env.HF_ACCESS_TOKEN
  if (!token) return res.status(500).json({ error: "Missing HF_ACCESS_TOKEN in server environment" })

  const body = readBody(req.body)
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients : []
  if (ingredients.length === 0) return res.status(400).json({ error: "Ingredients are required" })

  const ingredientsList = ingredients.join(", ")

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { response, data, text } = await askChefHugh(token, ingredientsList)

      // Happy path — model replied, parse its content
      if (response.ok) {
        const content = (data?.choices?.[0]?.message?.content || "").trim()

        try {
          const recipe = normalizeRecipeResponse(content, ingredients)
          return res.status(200).json({
            recipeName: recipe.recipeName,
            recipeMarkdown: recipe.recipeMarkdown
          })
        } catch {
          // Model returned something we can't parse — retry
          if (attempt < MAX_ATTEMPTS) { await wait(800); continue }
          return res.status(500).json({ error: "Chef Hugh's response was in an unexpected format. Please try again." })
        }
      }

      // Retryable server errors (rate-limit or overloaded)
      const canRetry = response.status === 429 || response.status === 503
      if (canRetry && attempt < MAX_ATTEMPTS) { await wait(1800); continue }

      const message = typeof data?.error === "string"
        ? data.error
        : text || `Hugging Face returned status ${response.status}`

      return res.status(response.status || 500).json({ error: message })
    } catch {

      if (attempt < MAX_ATTEMPTS) { await wait(1200); continue }
      return res.status(500).json({ error: "Recipe generation failed" })
    }
  }

  return res.status(500).json({ error: "Recipe generation failed" })
}