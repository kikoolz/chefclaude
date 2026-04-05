const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they 
could make with some or all of those ingredients. You don't need to use every ingredient they 
mention in your recipe. The recipe can include additional ingredients they didn't mention, but try 
not to include too many extra ingredients. Format your response in markdown to make it easier to 
render to a web page.
`;

const hfToken = import.meta.env.VITE_HF_API_KEY;
const IS_PRODUCTION = import.meta.env.PROD;
const HF_API_URL = IS_PRODUCTION
  ? "/api/recipe"
  : "/api/huggingface/v1/chat/completions";
const HF_MODELS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "deepseek-ai/DeepSeek-V3-0324",
  "Qwen/Qwen2.5-7B-Instruct-1M",
];

/**
 * Calls the Hugging Face API to generate a recipe based on user ingredients.
 */
export async function getRecipeFromMistral(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");
  const messages = [
    { role: "system", content: SYSTEM_PROMPT.trim() },
    {
      role: "user",
      content: `I have these ingredients: ${ingredientsString}. Suggest a recipe I can make.`,
    },
  ];

  try {
    if (!IS_PRODUCTION && !hfToken) {
      throw new Error("Missing VITE_HF_API_KEY in your .env file.");
    }

    let lastError = "No supported model was available.";

    for (const model of HF_MODELS) {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_PRODUCTION ? {} : { Authorization: `Bearer ${hfToken}` }),
        },
        body: JSON.stringify({
          messages,
          max_tokens: 512,
          temperature: 0.7,
          ...(IS_PRODUCTION ? { models: HF_MODELS } : { model }),
        }),
      });

      const rawBody = await response.text();
      let data = null;

      try {
        data = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        data = rawBody;
      }

      if (!response.ok) {
        lastError =
          data?.error?.message ||
          data?.error ||
          (typeof data === "string" && data.trim()) ||
          `API Error: ${response.status} - ${response.statusText}`;
        continue;
      }

      const recipe = data?.choices?.[0]?.message?.content;

      if (typeof recipe === "string" && recipe.trim()) {
        return recipe.trim();
      }

      lastError = "Unexpected response format from Hugging Face.";
    }

    throw new Error(lastError);
  } catch (err) {
    console.error("Error fetching recipe:", err);
    return `Error generating recipe: ${err.message}`;
  }
}
