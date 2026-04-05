
import React, { useState } from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ChefClaude";
import { getRecipeFromMistral } from "./ai";

export default function Main() {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);

  async function fetchRecipe() {
    if (ingredients.length === 0) {
      alert("Please add ingredients first!");
      return;
    }

    const generatedRecipe = await getRecipeFromMistral(ingredients);
    setRecipe(generatedRecipe);
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient")?.trim();
    if (newIngredient) {
      setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
    }
  }

  return (
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input type="text" placeholder="e.g beef" aria-label="Add ingredient" name="ingredient" />
        <button type="submit">Add ingredient</button>
      </form>

      <IngredientsList ingredients={ingredients} fetchRecipe={fetchRecipe} />

      {recipe && <ClaudeRecipe recipe={recipe} />}
    </main>
  );
}
