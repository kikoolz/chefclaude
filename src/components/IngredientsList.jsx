import React from 'react';

export default function IngredientsList({ ingredients, fetchRecipe }) {
  const ingredientsListItems = ingredients.map(ingredient => (
    <li key={ingredient}>{ingredient}</li>
  ));

  return (
    ingredients.length > 0 && (
      <section>
        <h2>Ingredients on hand:</h2>
        <ul className='ingredients-list' aria-live='polite'>
          {ingredientsListItems}
        </ul>
        {ingredients.length > 3 && (
          <div className='get-recipe-container'>
            <div>
              <h3>Ready for a recipe?</h3>
              <p>Generate a recipe from your list of ingredients.</p>
            </div>
            <button onClick={fetchRecipe}>Get a recipe</button>
          </div>
        )}
      </section>
    )
  );
}
