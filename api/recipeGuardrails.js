import remarkParse from "remark-parse"
import { unified } from "unified"
import { z } from "zod"

const markdown = unified().use(remarkParse)

const recipeShape = z.object({
  recipeName: z.string().trim().catch(""),
  summary: z.string().trim().catch(""),
  ingredients: z.array(z.string().trim()).catch([]),
  instructions: z.array(z.string().trim()).catch([])
})

function unwrapJsonFence(text) {
  const tree = markdown.parse(text)
  const only = tree.children?.length === 1 ? tree.children[0] : null

  if (only?.type !== "code") return ""

  const lang = String(only.lang || "").toLowerCase().trim()
  if (!lang || lang === "json") return String(only.value || "").trim()

  return ""
}

function findJson(text) {
  const trimmed = String(text || "").trim()
  if (!trimmed) return null

  const candidates = [trimmed]

  const fenced = unwrapJsonFence(trimmed)
  if (fenced) candidates.push(fenced)

  const open = trimmed.indexOf("{")
  const close = trimmed.lastIndexOf("}")
  if (open !== -1 && close > open) {
    candidates.push(trimmed.slice(open, close + 1))
  }

  for (const raw of candidates) {
    try {
      const obj = JSON.parse(raw)
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj
    } catch {}
  }

  return null
}

function pickRecipeName(name, ingredients) {
  // Use whatever the model gave us
  const first = String(name || "").split("\n").map((l) => l.trim()).find(Boolean)
  if (first) return first

  // Fall back to naming after the first ingredient
  const lead = ingredients?.[0]?.trim()
  return lead ? `${lead} Special` : "Chef Hugh Special"
}

function cleanList(items, max, fallback) {
  const good = items.map((i) => String(i || "").trim()).filter(Boolean).slice(0, max)
  return good.length > 0 ? good : fallback
}

function formatAsMarkdown(ingredients, instructions) {
  return [
    "## Ingredients",
    ...ingredients.map((item) => `- ${item}`),
    "",
    "## Instructions",
    ...instructions.map((step, i) => `${i + 1}. ${step}`)
  ].join("\n")
}

export function normalizeRecipeResponse(content, ingredients) {
  const json = findJson(content)
  if (!json) throw new Error("Model response is not valid JSON")

  const recipe = recipeShape.parse(json)
  const name = pickRecipeName(recipe.recipeName, ingredients)
  const ingredientList = cleanList(recipe.ingredients, 15, ["Ingredients not provided"])
  const steps = cleanList(recipe.instructions, 10, ["Instructions not provided"])

  return {
    recipeName: name,
    recipeMarkdown: formatAsMarkdown(ingredientList, steps)
  }
}
