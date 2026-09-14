import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { RECIPES } from '../../data/recipes'
import { useProfile } from '../../hooks/useProfile'
import { useSettings } from '../../hooks/useSettings'
import { calcBMR, calcTDEE, calcDailyTargets } from '../../domain/nutrition'
import { GroceryList } from './GroceryList'

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
      <div className="space-y-3">
        <Button variant="ghost" onClick={() => setShowGroceryList(false)}>← Back</Button>
        <GroceryList recipes={selectedRecipes} />
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-24">
      <Card className="bg-clay-50" data-testid="daily-target">
        <p className="text-sm text-clay-700">Today's target</p>
        <p className="text-lg font-semibold">{targets.calorieTarget} kcal · {targets.proteinTarget}g protein</p>
      </Card>

      {RECIPES.map((recipe) => (
        <Card
          key={recipe.id}
          onClick={() => toggle(recipe.id)}
          className={`cursor-pointer ${selectedIds.includes(recipe.id) ? 'ring-2 ring-sage-500' : ''}`}
        >
          <h3 className="font-medium">{recipe.name}</h3>
          <p className="text-xs text-ink-500">{recipe.kcal} kcal · {recipe.proteinG}g protein</p>
        </Card>
      ))}

      <div className="fixed inset-x-0 bottom-16 flex justify-center px-4">
        <Button onClick={() => setShowGroceryList(true)}>Grocery list ({selectedRecipes.length})</Button>
      </div>
    </div>
  )
}
