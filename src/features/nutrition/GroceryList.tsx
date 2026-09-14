import { Recipe } from '../../data/recipes'
import { generateGroceryList } from '../../domain/groceryList'
import { Card, Tone, TONE_MUTED } from '../../components/Card'
import { Pill } from '../../components/Pill'

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein', produce: 'Produce', grain: 'Grains', dairy: 'Dairy', pantry: 'Pantry',
}

/** One block colour per aisle, so the list reads as colour-coded sections. */
const CATEGORY_TONES: Record<string, Tone> = {
  protein: 'coral', produce: 'mint', grain: 'sun', dairy: 'sky', pantry: 'lilac',
}

export function GroceryList({ recipes }: { recipes: Recipe[] }) {
  const list = generateGroceryList(recipes)
  const hasAnyItems = Object.values(list).some((items) => items.length > 0)
  return (
    <div className="space-y-4">
      {!hasAnyItems && (
        <Card tone="cream">
          <p className="text-[15px] font-medium leading-snug text-ink-500">
            No meals selected yet — go back and tap a few meals to build your list.
          </p>
        </Card>
      )}
      {Object.entries(list)
        .filter(([, items]) => items.length > 0)
        .map(([category, items]) => {
          const tone = CATEGORY_TONES[category] ?? 'white'
          return (
            <Card key={category} tone={tone}>
              <Pill className="bg-ink-900/10">{CATEGORY_LABELS[category]}</Pill>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-4">
                    <span className="font-body text-[15px] font-medium leading-snug">{item.name}</span>
                    <span className={`numerals shrink-0 text-label font-bold ${TONE_MUTED[tone]}`}>
                      {item.qty}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
    </div>
  )
}
