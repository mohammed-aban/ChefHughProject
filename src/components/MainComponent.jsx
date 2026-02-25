import { useState, useRef, useEffect } from "react"
import HughRecipe from "./HughRecipe"
import IngredientsList from "./IngredientsList"
import { getRecipeFromChefHugh } from "../ai"

export default function Main() {
    const [ingredients, setIngredients] = useState([])
    const [recipeShown, setRecipeShown] = useState(false)
  const [recipeName, setRecipeName] = useState("")
    const [recipeMarkdown, setRecipeMarkdown] = useState("")
    const [recipeError, setRecipeError] = useState("")
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)
    const recipeSection = useRef(null)
    console.log(recipeSection)

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
      setRecipeName(generatedRecipe.recipeName || "")
      setRecipeMarkdown(generatedRecipe.recipeMarkdown || "")
    } catch (error) {
      setRecipeName("")
      setRecipeMarkdown("")
      setRecipeError(error?.message || "Unable to generate recipe right now.")
    } finally {
      setIsLoadingRecipe(false)
    }
  }

  useEffect(() => {
    if (recipeMarkdown !== "" && recipeSection !== null) {
      recipeSection.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [recipeMarkdown])

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
          <IngredientsList ingredients={ingredients} renderRecipe={renderRecipe} ref={recipeSection}/>
          {recipeShown ? <HughRecipe recipeName={recipeName} recipeMarkdown={recipeMarkdown} isLoading={isLoadingRecipe} error={recipeError} ingredients={ingredients} /> : null}
        </>
      ) : null}
    </main>
  );
}
