import { describe, it, expect } from 'vitest'
import { generateGroceryList } from './groceryList'
import { RECIPES } from '../data/recipes'

describe('generateGroceryList', () => {
  it('groups combined ingredients by category across the selected recipes', () => {
    const selected = [RECIPES[0], RECIPES[2]] // eggs breakfast + tinola
    const list = generateGroceryList(selected)
    expect(list.produce.map((i) => i.name)).toEqual(expect.arrayContaining(['Tomato', 'Malunggay leaves', 'Sayote']))
    expect(list.protein.map((i) => i.name)).toEqual(expect.arrayContaining(['Eggs', 'Chicken thigh (skinless)']))
  })

  it('merges duplicate ingredient names into one line', () => {
    const selected = [RECIPES[0], RECIPES[0]]
    const list = generateGroceryList(selected)
    expect(list.protein.filter((i) => i.name === 'Eggs')).toHaveLength(1)
  })

  it('combines quantities instead of dropping them when the same ingredient appears with a different qty across recipes', () => {
    const selected = [RECIPES[0], RECIPES[5]] // boiled-eggs-rice-tomato (Tomato, 1 pc) + grilled-bangus-ensalada (Tomato, 2 pcs)
    const list = generateGroceryList(selected)
    const tomatoLines = list.produce.filter((i) => i.name === 'Tomato')
    expect(tomatoLines).toHaveLength(1)
    expect(tomatoLines[0].qty).toBe('1 pc, 2 pcs')
  })
})
