import { Recipe } from '../../data/recipes'
import { generateGroceryList } from '../../domain/groceryList'
import { Card } from '../../components/Card'

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein', produce: 'Produce', grain: 'Grains', dairy: 'Dairy', pantry: 'Pantry',
}

export function GroceryList({ recipes }: { recipes: Recipe[] }) {
  const list = generateGroceryList(recipes)
  return (
    <div className="space-y-3">
      {Object.entries(list)
        .filter(([, items]) => items.length > 0)
        .map(([category, items]) => (
          <Card key={category}>
            <h3 className="font-medium">{CATEGORY_LABELS[category]}</h3>
            <ul className="list-disc pl-5 text-sm">
              {items.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span> — {item.qty}
                </li>
              ))}
            </ul>
          </Card>
        ))}
    </div>
  )
}
