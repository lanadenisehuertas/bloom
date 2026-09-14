import { useState } from 'react'
import { ArrowLeft, Check, Flame } from 'lucide-react'
import { Card } from '../../components/Card'
import { TONE_MUTED } from '../../components/tones'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { RECIPES, Recipe } from '../../data/recipes'
import { useProfile } from '../../hooks/useProfile'
import { useSettings } from '../../hooks/useSettings'
import { calcBMR, calcTDEE, calcDailyTargets } from '../../domain/nutrition'
import { GroceryList } from './GroceryList'

const SLOT_LABELS: Record<Recipe['slot'], string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner',
}

/**
 * Group the recipe list by meal slot, keeping each slot in the order it first
 * appears in RECIPES — so the sections follow the data, never a hardcoded list.
 */
function groupBySlot(recipes: Recipe[]) {
  const groups: { slot: Recipe['slot']; recipes: Recipe[] }[] = []
  for (const recipe of recipes) {
    const group = groups.find((g) => g.slot === recipe.slot)
    if (group) group.recipes.push(recipe)
    else groups.push({ slot: recipe.slot, recipes: [recipe] })
  }
  return groups
}

export function NutritionScreen() {
  const { profile } = useProfile()
  const { settings } = useSettings()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showGroceryList, setShowGroceryList] = useState(false)

  const targets = profile
    ? calcDailyTargets(calcTDEE(calcBMR(profile.weightKg, profile.heightCm, profile.age), profile.activityLevel), profile.weightKg)
    : { calorieTarget: settings.currentCalorieTarget, proteinTarget: settings.currentProteinTarget }

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const selectedRecipes = RECIPES.filter((r) => selectedIds.includes(r.id))

  if (showGroceryList) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="gap-2 px-2 no-underline"
          onClick={() => setShowGroceryList(false)}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </Button>
        <header className="px-1">
          <p className="text-label font-medium text-ink-500">Shopping</p>
          <h1 className="font-display text-3xl font-extrabold leading-tight">Grocery list</h1>
        </header>
        <GroceryList recipes={selectedRecipes} />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-32">
      <header className="px-1">
        <p className="text-label font-medium text-ink-500">Today</p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">Food</h1>
      </header>

      {/* Hero: the number she's actually steering by */}
      <Card tone="rose" data-testid="daily-target">
        <Pill className="bg-white/20 text-white">
          <Flame size={13} aria-hidden="true" />
          Daily target
        </Pill>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="numerals font-display text-numeral font-extrabold">
            {targets.calorieTarget}
          </span>
          <span className={`font-body text-[15px] font-bold ${TONE_MUTED.rose}`}>kcal</span>
        </div>
        <p className={`mt-1 text-label font-medium ${TONE_MUTED.rose}`}>
          <span className="numerals font-bold">{targets.proteinTarget}g</span> protein to hit today
        </p>
      </Card>

      {groupBySlot(RECIPES).map(({ slot, recipes }) => (
        <section key={slot} className="space-y-3">
          <div className="flex items-baseline gap-2 px-1">
            <h2 className="font-display text-lg font-bold">{SLOT_LABELS[slot]}</h2>
            <span className="numerals text-label font-medium text-ink-500">
              {recipes.length} option{recipes.length === 1 ? '' : 's'}
            </span>
          </div>

          {recipes.map((recipe) => {
            const isSelected = selectedIds.includes(recipe.id)
            return (
              <button
                key={recipe.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(recipe.id)}
                className={`flex w-full items-center gap-3 rounded-block p-5 text-left transition-colors duration-200 active:scale-[0.99] ${
                  isSelected ? 'bg-mint text-ink-900' : 'bg-white text-ink-900'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[17px] font-extrabold leading-snug">
                    {recipe.name}
                  </span>
                  <span className="numerals mt-2 inline-block rounded-chip bg-ink-900/5 px-3 py-1 text-label font-bold">
                    {recipe.kcal} kcal · {recipe.proteinG}g protein
                  </span>
                </span>
                {/* Never colour alone: selection also carries a check mark. */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? 'bg-ink-900 text-mint' : 'border-2 border-cream-edge'
                  }`}
                >
                  {isSelected && <Check size={17} strokeWidth={3} aria-hidden="true" />}
                </span>
              </button>
            )
          })}
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-16 z-10 flex justify-center bg-cream px-4 pb-3 pt-3">
        <Button onClick={() => setShowGroceryList(true)}>
          Grocery list ({selectedRecipes.length})
        </Button>
      </div>
    </div>
  )
}
