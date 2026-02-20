import { useState } from "react"
import HughRecipe from "./HughRecipe"
import IngredientsList from "./IngredientsList"
import { getRecipeFromChefHugh } from "../ai"

export default function Main() {
    const [ingredients, setIngredients] = useState([])
    const [recipeShown, setRecipeShown] = useState(false)
    const [recipeMarkdown, setRecipeMarkdown] = useState("")
    const [recipeError, setRecipeError] = useState("")
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient")
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient])
  }

  async function renderRecipe(event) {
    event.preventDefault()
    setRecipeShown(true)
    setRecipeError("")
    setIsLoadingRecipe(true)

    try {
      const generatedRecipe = await getRecipeFromChefHugh(ingredients)
      setRecipeMarkdown(generatedRecipe)
    } catch (error) {
      setRecipeMarkdown("")
      setRecipeError(error?.message || "Unable to generate recipe right now.")
    } finally {
      setIsLoadingRecipe(false)
    }
  }

  return (
    <main className="main">
      <form action={addIngredient} className="ingredient-form">
        <input
          className="ingredient-form__input"
          type="text"
          placeholder="e.g. Oregano"
          aria-label="Add ingredient"
		  name="ingredient"
        />
        <button className="ingredient-form__button" type="submit">
          + Add ingredient
        </button>
      </form>

      {ingredients.length > 0 ? (
        <>
          <IngredientsList ingredients={ingredients} renderRecipe={renderRecipe}/>
          {recipeShown ? <HughRecipe recipeMarkdown={recipeMarkdown} isLoading={isLoadingRecipe} error={recipeError} ingredients={ingredients} /> : null}
        </>
      ) : null}
    </main>
  );
}
