import React from 'react'

export default function IngredientsList(props) {

    const ingredientsList = props.ingredients.map((ingredient) => {
      return (
          <li className="ingredients-list__item" key={ingredient}>{ingredient}</li>
      )
    })

    function decideSummary() {
    if (props.ingredients.length < 4) {
      return "Please add at least 4 ingredients so Chef Hugh can craft the most relevant, high-quality recipe suggestions for you."
    }

    return "Generate a curated list of recipes based on the ingredients you currently have on hand."
  }

  return (
    <>
        <h1 className="ingredients-title">Ingredients on hand:</h1>
        <ul className="ingredients-list">{ingredientsList}</ul>

    <section className="ingredients-summary" aria-live="polite">
        <div className="ingredients-summary__content">
            <h2 className="ingredients-summary__title">Ready to cook?</h2>
            <p className="ingredients-summary__text">
            {decideSummary()}
            </p>
        </div>
        {props.ingredients.length > 3 ?<button className="ingredients-summary__button" type="button" onClick={props.renderRecipe}>
        Get recipes
        </button> : null}
    </section>
    </>
  )
}
