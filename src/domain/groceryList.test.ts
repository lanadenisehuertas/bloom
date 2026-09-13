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
})
