export interface Ingredient {
  name: string
  category: 'protein' | 'produce' | 'grain' | 'dairy' | 'pantry'
  qty: string
}

export interface Recipe {
  id: string
  name: string
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  kcal: number
  proteinG: number
  ingredients: Ingredient[]
}

export const RECIPES: Recipe[] = [
  { id: 'boiled-eggs-rice-tomato', name: 'Boiled Eggs + Garlic Rice + Tomato', slot: 'breakfast', kcal: 380, proteinG: 18,
    ingredients: [
      { name: 'Eggs', category: 'protein', qty: '2 pcs' },
      { name: 'Garlic rice (small)', category: 'grain', qty: '1 cup' },
      { name: 'Tomato', category: 'produce', qty: '1 pc' },
    ] },
  { id: 'oatmeal-banana-pb', name: 'Oatmeal + Banana + Peanut Butter', slot: 'breakfast', kcal: 360, proteinG: 14,
    ingredients: [
      { name: 'Rolled oats', category: 'grain', qty: '1/2 cup' },
      { name: 'Banana', category: 'produce', qty: '1 pc' },
      { name: 'Peanut butter', category: 'pantry', qty: '1 tbsp' },
    ] },
  { id: 'tinolang-manok', name: 'Tinolang Manok (Chicken + Malunggay/Sayote)', slot: 'lunch', kcal: 420, proteinG: 32,
    ingredients: [
      { name: 'Chicken thigh (skinless)', category: 'protein', qty: '150g' },
      { name: 'Malunggay leaves', category: 'produce', qty: '1 cup' },
      { name: 'Sayote', category: 'produce', qty: '1 pc' },
      { name: 'Rice', category: 'grain', qty: '1 cup' },
    ] },
  { id: 'ginisang-monggo', name: 'Ginisang Monggo', slot: 'lunch', kcal: 160, proteinG: 13,
    ingredients: [
      { name: 'Mung beans (monggo)', category: 'pantry', qty: '1/2 cup' },
      { name: 'Malunggay/spinach', category: 'produce', qty: '1/2 cup' },
      { name: 'Garlic, onion, tomato', category: 'produce', qty: '1 set' },
    ] },
  { id: 'tuna-guisado', name: 'Tuna Guisado', slot: 'lunch', kcal: 300, proteinG: 26,
    ingredients: [
      { name: 'Canned tuna', category: 'protein', qty: '1 can' },
      { name: 'Tomato, onion, garlic', category: 'produce', qty: '1 set' },
      { name: 'Rice', category: 'grain', qty: '1 cup' },
    ] },
  { id: 'grilled-bangus-ensalada', name: 'Grilled Bangus/Tilapia + Ensaladang Kamatis', slot: 'dinner', kcal: 380, proteinG: 30,
    ingredients: [
      { name: 'Bangus or tilapia', category: 'protein', qty: '1 medium fillet' },
      { name: 'Tomato', category: 'produce', qty: '2 pcs' },
      { name: 'Red onion', category: 'produce', qty: '1/2 pc' },
      { name: 'Rice (small)', category: 'grain', qty: '1/2 cup' },
    ] },
  { id: 'chicken-adobo-lean', name: 'Lean Chicken Adobo (Skinless, Measured Rice)', slot: 'dinner', kcal: 400, proteinG: 30,
    ingredients: [
      { name: 'Chicken breast/thigh (skinless)', category: 'protein', qty: '150g' },
      { name: 'Soy sauce, vinegar, garlic', category: 'pantry', qty: '1 set' },
      { name: 'Rice (small)', category: 'grain', qty: '1/2 cup' },
    ] },
  { id: 'tokwa-egg-toyomansi', name: "Tokwa (Tofu) + Boiled Egg + Toyomansi", slot: 'dinner', kcal: 320, proteinG: 24,
    ingredients: [
      { name: 'Tofu (tokwa)', category: 'protein', qty: '150g' },
      { name: 'Egg', category: 'protein', qty: '1 pc' },
      { name: 'Soy sauce + calamansi', category: 'pantry', qty: '1 set' },
    ] },
  { id: 'greek-yogurt-fruit', name: 'Greek Yogurt or Boiled Egg + Fruit', slot: 'snack', kcal: 150, proteinG: 12,
    ingredients: [
      { name: 'Greek yogurt or 1 egg', category: 'dairy', qty: '1 cup / 1 pc' },
      { name: 'Fruit (banana, apple, or seasonal)', category: 'produce', qty: '1 pc' },
    ] },
  { id: 'fruit-or-nuts', name: 'Fruit or Small Handful of Nuts', slot: 'snack', kcal: 100, proteinG: 3,
    ingredients: [{ name: 'Fruit or mixed nuts', category: 'produce', qty: '1 serving' }] },
]

/** Pre-planned, slightly-higher-carb late-luteal snack option — reframed as normal, not "cheating". */
export const LUTEAL_SNACK_OPTION: Recipe = {
  id: 'luteal-higher-carb-snack', name: 'Rice Cake + Peanut Butter (Planned Luteal Snack)', slot: 'snack', kcal: 220, proteinG: 6,
  ingredients: [
    { name: 'Rice cakes', category: 'grain', qty: '2 pcs' },
    { name: 'Peanut butter', category: 'pantry', qty: '1 tbsp' },
  ],
}
