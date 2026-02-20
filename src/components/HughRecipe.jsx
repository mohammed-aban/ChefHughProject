import React from 'react'
import ReactMarkdown from 'react-markdown'

const markdownComponents = {
  h1: ({ children }) => <h3>{children}</h3>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <strong>{children}</strong>
}

export default function HughRecipe({ recipeMarkdown, isLoading, error, ingredients = [] }) {
  const fallbackRecipeName = ingredients.length > 0 ? `${ingredients[0]} Special` : "Chef Hugh Special"

  if (isLoading) {
    return (
      <section className="suggested-recipes-section">
        <h2>Chef Hugh Recommends:</h2>
        <article className="suggested-recipe-container" aria-live="polite">
          <p>Generating your recipe...</p>
        </article>
      </section>
    )
  }

  if (error) {
    return (
      <section className="suggested-recipes-section">
        <h2>Chef Hugh Recommends:</h2>
        <article className="suggested-recipe-container" aria-live="polite">
          <p>{error}</p>
        </article>
      </section>
    )
  }

  if (!recipeMarkdown?.trim()) {
    return null
  }

  return (
    <section className="suggested-recipes-section">
      <h2>Chef Hugh Recommends:</h2>
      <article className="suggested-recipe-container" aria-live="polite">
        <p>Based on the ingredients you have available, I would recommend making a simple and delicious <strong>{fallbackRecipeName}</strong>. Here is the recipe:</p>
        <ReactMarkdown components={markdownComponents}>{recipeMarkdown}</ReactMarkdown>
      </article>
    </section>
  )
}
