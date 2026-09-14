import { Food } from '../db/schema'

/**
 * A hand-curated set of common Filipino and everyday foods, covering what a
 * home-cooked-food eater in the Philippines actually logs day to day. Values
 * are household-standard nutritional approximations (per 100g), not sourced
 * from a bundled third-party dataset — bundling Open Food Facts or the FNRI
 * Philippine Food Composition Tables directly was ruled out for v1 (ODbL
 * share-alike obligations and FNRI's FOI-only bulk-data access respectively;
 * see the design-system doc for the fuller research writeup). Anything not on
 * this list can still be logged via the "quick add" calorie-only entry.
 *
 * `servings` are always household measures with a fixed gram weight — never a
 * generic volume-to-mass conversion, which varies per food and is a common
 * source of large errors.
 */
export const FOODS: Food[] = [
  // Rice & staples
  { id: 'rice-white-cooked', name: 'Steamed white rice', servings: [{ label: '1 cup', grams: 158 }, { label: '1/2 cup', grams: 79 }], per100g: { kcal: 130, proteinG: 2.7, carbG: 28.2, fatG: 0.3 } },
  { id: 'rice-garlic', name: 'Garlic fried rice (sinangag)', servings: [{ label: '1 cup', grams: 165 }], per100g: { kcal: 163, proteinG: 3.0, carbG: 28.9, fatG: 4.0 } },
  { id: 'rice-brown-cooked', name: 'Steamed brown rice', servings: [{ label: '1 cup', grams: 195 }], per100g: { kcal: 112, proteinG: 2.6, carbG: 23.5, fatG: 0.9 } },
  { id: 'pandesal', name: 'Pandesal', servings: [{ label: '1 pc', grams: 30 }], per100g: { kcal: 297, proteinG: 8.9, carbG: 54.0, fatG: 4.8 } },
  { id: 'oatmeal-cooked', name: 'Oatmeal, cooked in water', servings: [{ label: '1 cup', grams: 234 }], per100g: { kcal: 71, proteinG: 2.5, carbG: 12.0, fatG: 1.5 } },
  { id: 'bread-white', name: 'White bread', servings: [{ label: '1 slice', grams: 28 }], per100g: { kcal: 265, proteinG: 9.0, carbG: 49.0, fatG: 3.2 } },
  { id: 'kamote', name: 'Boiled sweet potato (kamote)', servings: [{ label: '1 medium', grams: 130 }], per100g: { kcal: 86, proteinG: 1.6, carbG: 20.1, fatG: 0.1 } },
  { id: 'saba-boiled', name: 'Boiled saging na saba', servings: [{ label: '1 pc', grams: 100 }], per100g: { kcal: 122, proteinG: 1.2, carbG: 31.9, fatG: 0.3 } },

  // Chicken & meat dishes
  { id: 'chicken-adobo', name: 'Chicken adobo (skinless)', servings: [{ label: '1 serving', grams: 150 }], per100g: { kcal: 178, proteinG: 20.0, carbG: 2.0, fatG: 9.5 } },
  { id: 'chicken-breast-grilled', name: 'Grilled chicken breast, skinless', servings: [{ label: '1 piece', grams: 120 }], per100g: { kcal: 165, proteinG: 31.0, carbG: 0, fatG: 3.6 } },
  { id: 'chicken-tinola', name: 'Tinolang manok', servings: [{ label: '1 bowl', grams: 300 }], per100g: { kcal: 65, proteinG: 8.0, carbG: 3.0, fatG: 2.2 } },
  { id: 'chicken-thigh-cooked', name: 'Chicken thigh, skinless, cooked', servings: [{ label: '1 piece', grams: 100 }], per100g: { kcal: 179, proteinG: 24.6, carbG: 0, fatG: 8.4 } },
  { id: 'pork-adobo', name: 'Pork adobo', servings: [{ label: '1 serving', grams: 150 }], per100g: { kcal: 250, proteinG: 18.0, carbG: 2.5, fatG: 18.0 } },
  { id: 'pork-sinigang', name: 'Sinigang na baboy', servings: [{ label: '1 bowl', grams: 350 }], per100g: { kcal: 70, proteinG: 7.5, carbG: 3.5, fatG: 3.2 } },
  { id: 'beef-nilaga', name: 'Nilagang baka', servings: [{ label: '1 bowl', grams: 350 }], per100g: { kcal: 90, proteinG: 10.0, carbG: 4.0, fatG: 3.8 } },
  { id: 'lechon-kawali', name: 'Lechon kawali', servings: [{ label: '1 serving', grams: 100 }], per100g: { kcal: 400, proteinG: 22.0, carbG: 1.0, fatG: 33.0 } },
  { id: 'tocino', name: 'Pork tocino, cooked', servings: [{ label: '2 pcs', grams: 90 }], per100g: { kcal: 250, proteinG: 16.0, carbG: 10.0, fatG: 16.0 } },
  { id: 'longganisa', name: 'Longganisa, cooked', servings: [{ label: '2 links', grams: 80 }], per100g: { kcal: 280, proteinG: 14.0, carbG: 6.0, fatG: 22.0 } },
  { id: 'sisig', name: 'Sisig (pork)', servings: [{ label: '1 serving', grams: 200 }], per100g: { kcal: 260, proteinG: 18.0, carbG: 3.0, fatG: 19.0 } },

  // Fish & seafood
  { id: 'bangus-grilled', name: 'Grilled bangus (milkfish)', servings: [{ label: '1 medium fillet', grams: 150 }], per100g: { kcal: 170, proteinG: 20.5, carbG: 0, fatG: 9.0 } },
  { id: 'tilapia-fried', name: 'Fried tilapia', servings: [{ label: '1 medium', grams: 150 }], per100g: { kcal: 190, proteinG: 22.0, carbG: 1.0, fatG: 10.5 } },
  { id: 'tuna-canned-water', name: 'Canned tuna in water, drained', servings: [{ label: '1 can', grams: 100 }], per100g: { kcal: 116, proteinG: 25.5, carbG: 0, fatG: 1.0 } },
  { id: 'sardines-canned', name: 'Canned sardines in tomato sauce', servings: [{ label: '1 can', grams: 155 }], per100g: { kcal: 155, proteinG: 15.0, carbG: 3.0, fatG: 9.0 } },
  { id: 'shrimp-boiled', name: 'Boiled shrimp', servings: [{ label: '1 serving', grams: 100 }], per100g: { kcal: 99, proteinG: 24.0, carbG: 0.2, fatG: 0.3 } },
  { id: 'daing-na-bangus', name: 'Daing na bangus, fried', servings: [{ label: '1 medium', grams: 150 }], per100g: { kcal: 210, proteinG: 21.0, carbG: 1.0, fatG: 13.0 } },

  // Vegetable & legume dishes
  { id: 'monggo-guisado', name: 'Ginisang monggo', servings: [{ label: '1 bowl', grams: 250 }], per100g: { kcal: 64, proteinG: 5.2, carbG: 8.5, fatG: 1.4 } },
  { id: 'pinakbet', name: 'Pinakbet', servings: [{ label: '1 serving', grams: 200 }], per100g: { kcal: 70, proteinG: 3.0, carbG: 9.0, fatG: 2.8 } },
  { id: 'laing', name: 'Laing', servings: [{ label: '1 serving', grams: 150 }], per100g: { kcal: 140, proteinG: 3.5, carbG: 6.0, fatG: 12.0 } },
  { id: 'chopsuey', name: 'Chopsuey (mixed vegetables)', servings: [{ label: '1 serving', grams: 200 }], per100g: { kcal: 55, proteinG: 2.5, carbG: 6.5, fatG: 2.2 } },
  { id: 'ampalaya-egg', name: 'Ginisang ampalaya with egg', servings: [{ label: '1 serving', grams: 180 }], per100g: { kcal: 90, proteinG: 6.0, carbG: 4.0, fatG: 5.5 } },
  { id: 'malunggay-soup', name: 'Malunggay in soup/tinola-style', servings: [{ label: '1 cup', grams: 150 }], per100g: { kcal: 25, proteinG: 3.0, carbG: 3.0, fatG: 0.5 } },

  // Tofu & egg
  { id: 'tokwa', name: 'Fried tokwa (tofu)', servings: [{ label: '1 block', grams: 100 }], per100g: { kcal: 155, proteinG: 12.5, carbG: 3.0, fatG: 10.0 } },
  { id: 'egg-boiled', name: 'Boiled egg', servings: [{ label: '1 pc', grams: 50 }], per100g: { kcal: 155, proteinG: 13.0, carbG: 1.1, fatG: 11.0 } },
  { id: 'egg-fried', name: 'Fried egg', servings: [{ label: '1 pc', grams: 50 }], per100g: { kcal: 196, proteinG: 13.6, carbG: 0.8, fatG: 15.3 } },
  { id: 'tortang-talong', name: 'Tortang talong (eggplant omelette)', servings: [{ label: '1 pc', grams: 120 }], per100g: { kcal: 130, proteinG: 7.0, carbG: 5.0, fatG: 9.0 } },

  // Snacks / merienda
  { id: 'turon', name: 'Turon (banana + jackfruit lumpia)', servings: [{ label: '1 pc', grams: 60 }], per100g: { kcal: 260, proteinG: 2.5, carbG: 45.0, fatG: 8.5 } },
  { id: 'banana-cue', name: 'Banana cue', servings: [{ label: '1 stick', grams: 90 }], per100g: { kcal: 210, proteinG: 1.0, carbG: 45.0, fatG: 4.5 } },
  { id: 'kwek-kwek', name: 'Kwek-kwek (orange-battered quail egg)', servings: [{ label: '3 pcs', grams: 75 }], per100g: { kcal: 220, proteinG: 9.0, carbG: 18.0, fatG: 13.0 } },
  { id: 'siopao-asado', name: 'Siopao asado', servings: [{ label: '1 pc', grams: 120 }], per100g: { kcal: 240, proteinG: 8.5, carbG: 38.0, fatG: 6.5 } },
  { id: 'suman', name: 'Suman (sticky rice cake)', servings: [{ label: '1 pc', grams: 80 }], per100g: { kcal: 200, proteinG: 2.5, carbG: 42.0, fatG: 3.0 } },
  { id: 'biscuits-crackers', name: 'Plain crackers/biscuits', servings: [{ label: '4 pcs', grams: 20 }], per100g: { kcal: 440, proteinG: 8.0, carbG: 70.0, fatG: 14.0 } },
  { id: 'peanuts-roasted', name: 'Roasted peanuts', servings: [{ label: '1 small handful', grams: 30 }], per100g: { kcal: 585, proteinG: 24.0, carbG: 21.0, fatG: 50.0 } },
  { id: 'chicharon', name: 'Chicharon (pork rind)', servings: [{ label: '1 small handful', grams: 30 }], per100g: { kcal: 520, proteinG: 60.0, carbG: 0, fatG: 30.0 } },

  // Fruits
  { id: 'banana', name: 'Banana (lakatan/latundan)', servings: [{ label: '1 medium', grams: 100 }], per100g: { kcal: 89, proteinG: 1.1, carbG: 22.8, fatG: 0.3 } },
  { id: 'mango-ripe', name: 'Ripe mango', servings: [{ label: '1 cup sliced', grams: 165 }], per100g: { kcal: 60, proteinG: 0.8, carbG: 15.0, fatG: 0.4 } },
  { id: 'papaya', name: 'Papaya', servings: [{ label: '1 cup cubed', grams: 145 }], per100g: { kcal: 43, proteinG: 0.5, carbG: 11.0, fatG: 0.3 } },
  { id: 'watermelon', name: 'Watermelon', servings: [{ label: '1 cup diced', grams: 150 }], per100g: { kcal: 30, proteinG: 0.6, carbG: 7.6, fatG: 0.2 } },
  { id: 'apple', name: 'Apple', servings: [{ label: '1 medium', grams: 180 }], per100g: { kcal: 52, proteinG: 0.3, carbG: 13.8, fatG: 0.2 } },
  { id: 'pineapple', name: 'Pineapple', servings: [{ label: '1 cup chunks', grams: 165 }], per100g: { kcal: 50, proteinG: 0.5, carbG: 13.1, fatG: 0.1 } },

  // Dairy & drinks
  { id: 'milk-fresh', name: 'Fresh milk', servings: [{ label: '1 glass', grams: 244 }], per100g: { kcal: 61, proteinG: 3.2, carbG: 4.8, fatG: 3.3 } },
  { id: 'yogurt-plain', name: 'Plain yogurt', servings: [{ label: '1 cup', grams: 245 }], per100g: { kcal: 61, proteinG: 3.5, carbG: 4.7, fatG: 3.3 } },
  { id: 'coffee-black', name: 'Black coffee (no sugar/creamer)', servings: [{ label: '1 cup', grams: 240 }], per100g: { kcal: 1, proteinG: 0.1, carbG: 0, fatG: 0 } },
  { id: 'coffee-3in1', name: '3-in-1 instant coffee', servings: [{ label: '1 sachet', grams: 20 }], per100g: { kcal: 460, proteinG: 4.0, carbG: 70.0, fatG: 18.0 } },
  { id: 'soft-drink', name: 'Soft drink (regular)', servings: [{ label: '1 can', grams: 330 }], per100g: { kcal: 42, proteinG: 0, carbG: 10.6, fatG: 0 } },
  { id: 'buko-juice', name: 'Buko (coconut) juice, fresh', servings: [{ label: '1 glass', grams: 240 }], per100g: { kcal: 19, proteinG: 0.7, carbG: 3.7, fatG: 0.2 } },

  // Generic/Western staples (for flexibility)
  { id: 'chicken-breast-generic', name: 'Chicken breast, plain cooked', servings: [{ label: '100 g', grams: 100 }], per100g: { kcal: 165, proteinG: 31.0, carbG: 0, fatG: 3.6 } },
  { id: 'peanut-butter', name: 'Peanut butter', servings: [{ label: '1 tbsp', grams: 16 }], per100g: { kcal: 588, proteinG: 25.0, carbG: 20.0, fatG: 50.0 } },
  { id: 'cheese-slice', name: 'Cheese, sliced', servings: [{ label: '1 slice', grams: 20 }], per100g: { kcal: 402, proteinG: 25.0, carbG: 1.3, fatG: 33.0 } },
  { id: 'oil-cooking', name: 'Cooking oil', servings: [{ label: '1 tbsp', grams: 14 }], per100g: { kcal: 884, proteinG: 0, carbG: 0, fatG: 100.0 } },
]

/** Simple case-insensitive substring search over name — no external index needed
 *  at this list size (~60 items); revisit if the list grows into the hundreds. */
export function searchFoods(query: string): Food[] {
  const q = query.trim().toLowerCase()
  if (!q) return FOODS
  return FOODS.filter((f) => f.name.toLowerCase().includes(q))
}

export function getFoodById(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id)
}
