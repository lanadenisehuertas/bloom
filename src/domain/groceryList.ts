import { Ingredient, Recipe } from '../data/recipes'

export type GroceryList = Record<Ingredient['category'], Ingredient[]>

export function generateGroceryList(recipes: Recipe[]): GroceryList {
  const list: GroceryList = { protein: [], produce: [], grain: [], dairy: [], pantry: [] }
  const seen = new Set<string>()

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = `${ingredient.category}:${ingredient.name}`
      if (seen.has(key)) continue
      seen.add(key)
      list[ingredient.category].push(ingredient)
    }
  }
  return list
}
