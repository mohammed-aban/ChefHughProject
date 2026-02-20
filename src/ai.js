const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
const REQUEST_TIMEOUT_MS = 15000

function normalizeIngredients(ingredientsArr) {
  if (!Array.isArray(ingredientsArr)) {
    return []
  }

  return ingredientsArr
    .map((ingredient) => String(ingredient || "").trim())
    .filter(Boolean)
}

async function safeReadJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function getFriendlyFetchError(data) {
  return data?.error || "I couldn't generate a recipe right now. Please try again in a moment."
}

export async function getRecipeFromChefHugh(ingredientsArr) {
  const ingredients = normalizeIngredients(ingredientsArr)

  if (ingredients.length === 0) {
    throw new Error("Please add at least one ingredient to get a recipe.")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/api/recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ingredients }),
      signal: controller.signal
    })

    const data = await safeReadJson(response)

    if (!response.ok) {
      throw new Error(getFriendlyFetchError(data))
    }

    return (data?.recipeMarkdown || "").trim() || "No recipe generated."
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The recipe request took too long. Please try again.")
    }

    throw error instanceof Error
      ? error
      : new Error("Something went wrong while generating your recipe.")
  } finally {
    clearTimeout(timeoutId)
  }
}
