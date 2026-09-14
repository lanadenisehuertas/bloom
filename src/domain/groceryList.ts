import { Ingredient, Recipe } from '../data/recipes'

export type GroceryList = Record<Ingredient['category'], Ingredient[]>

export function generateGroceryList(recipes: Recipe[]): GroceryList {
  const list: GroceryList = { protein: [], produce: [], grain: [], dairy: [], pantry: [] }
  const seen = new Map<string, Ingredient>()

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = `${ingredient.category}:${ingredient.name}`
      const existing = seen.get(key)
      if (existing) {
        if (existing.qty !== ingredient.qty) {
          existing.qty = `${existing.qty}, ${ingredient.qty}`
        }
        continue
      }
      const copy = { ...ingredient }
      seen.set(key, copy)
      list[ingredient.category].push(copy)
    }
  }
  return list
}
