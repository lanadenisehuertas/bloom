import { useMemo, useState } from 'react'
import { Search, Plus, Trash2, Clock3 } from 'lucide-react'
import { Card } from '../../components/Card'
import { Tone, TONE_MUTED } from '../../components/tones'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { Modal } from '../../components/Modal'
import { useFoodLog, useFrequentFoods } from '../../hooks/useFoodLog'
import { searchFoods, getFoodById } from '../../data/foods'
import { Food, FoodLogEntry } from '../../db/schema'
import { resolveServingTotals } from '../../domain/calories'

const SLOT_LABELS: Record<FoodLogEntry['slot'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
}

const SLOT_ORDER: FoodLogEntry['slot'][] = ['breakfast', 'lunch', 'snack', 'dinner']

const SLOT_TONES: Record<FoodLogEntry['slot'], Tone> = {
  breakfast: 'sun',
  lunch: 'mint',
  snack: 'lilac',
  dinner: 'sky',
}

const QUANTITY_STEPS = [0.5, 1, 1.5, 2]

/**
 * Infers a sensible default meal slot from the current time of day, so
 * logging never forces an up-front "which meal is this" decision.
 */
function inferSlotFromTime(now: Date = new Date()): FoodLogEntry['slot'] {
  const hour = now.getHours()
  if (hour < 10) return 'breakfast'
  if (hour < 14) return 'lunch'
  if (hour < 17) return 'snack'
  return 'dinner'
}

/** Groups today's entries by slot, in a fixed display order, dropping empty slots. */
function groupEntriesBySlot(entries: FoodLogEntry[]) {
  return SLOT_ORDER.map((slot) => ({
    slot,
    entries: entries.filter((e) => e.slot === slot),
  })).filter((g) => g.entries.length > 0)
}

/** Shared serving + quantity picker used both for a catalog Food and for
 *  re-logging a past entry (which may or may not resolve back to a Food). */
function LogFoodModal({
  open,
  onClose,
  food,
  initialServingLabel,
  initialQuantity,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  food: Food | undefined
  initialServingLabel: string
  initialQuantity: number
  onConfirm: (servingLabel: string, quantity: number) => void
}) {
  const [servingLabel, setServingLabel] = useState(initialServingLabel)
  const [quantity, setQuantity] = useState(initialQuantity)

  if (!open || !food) return null

  const totals = resolveServingTotals(food, servingLabel, quantity)

  return (
    <Modal open={open} onClose={onClose} title={food.name}>
      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-label font-bold">Serving</legend>
          <div className="flex flex-wrap gap-2">
            {food.servings.map((s) => (
              <button
                key={s.label}
                type="button"
                aria-pressed={servingLabel === s.label}
                onClick={() => setServingLabel(s.label)}
                className={`min-h-[48px] rounded-chip px-4 py-2 text-[15px] font-bold transition-colors duration-200 ${
                  servingLabel === s.label ? 'bg-ink-900 text-white' : 'bg-cream-deep text-ink-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-label font-bold">Quantity</legend>
          <div className="flex gap-2" role="radiogroup" aria-label="Quantity">
            {QUANTITY_STEPS.map((q) => (
              <button
                key={q}
                type="button"
                role="radio"
                aria-checked={quantity === q}
                aria-label={`${q} serving${q === 1 ? '' : 's'}`}
                onClick={() => setQuantity(q)}
                className={`numerals min-h-[48px] flex-1 rounded-chip font-display text-lg font-extrabold transition-colors duration-200 ${
                  quantity === q ? 'bg-ink-900 text-white' : 'bg-cream-deep text-ink-500'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </fieldset>

        <Card tone="cream" className="flex items-baseline justify-between">
          <span className="text-label font-medium text-ink-500">This will log</span>
          <span className="numerals font-display text-lg font-extrabold">
            {totals.kcal} kcal <span className="text-label font-bold text-ink-500">· {totals.proteinG}g protein</span>
          </span>
        </Card>

        <Button
          className="w-full"
          onClick={() => {
            onConfirm(servingLabel, quantity)
            onClose()
          }}
        >
          Log it
        </Button>
      </div>
    </Modal>
  )
}

function QuickAddModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (kcal: number, proteinG: number) => void
}) {
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')

  const kcalValue = Number(kcal)
  const canSubmit = kcal.trim() !== '' && kcalValue > 0

  return (
    <Modal open={open} onClose={onClose} title="Quick add calories">
      <div className="space-y-5">
        <p className="text-[15px] font-medium leading-snug text-ink-500">
          Not on the list, or eating out? Log just the numbers — no food entry required.
        </p>

        <div>
          <label htmlFor="quick-add-kcal" className="mb-2 block text-label font-bold">
            Calories (kcal)
          </label>
          <input
            id="quick-add-kcal"
            type="number"
            inputMode="numeric"
            min={0}
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            className="min-h-[48px] w-full rounded-chip border-2 border-cream-edge bg-white px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="quick-add-protein" className="mb-2 block text-label font-bold">
            Protein (g) — optional
          </label>
          <input
            id="quick-add-protein"
            type="number"
            inputMode="numeric"
            min={0}
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="min-h-[48px] w-full rounded-chip border-2 border-cream-edge bg-white px-4 py-3"
          />
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit}
          onClick={() => {
            onConfirm(kcalValue, Number(protein) || 0)
            setKcal('')
            setProtein('')
            onClose()
          }}
        >
          Log it
        </Button>
      </div>
    </Modal>
  )
}

export function FoodLogger() {
  const { entries, logFood, logAgain, removeEntry } = useFoodLog()
  const recents = useFrequentFoods()
  const [query, setQuery] = useState('')
  const [pickerFood, setPickerFood] = useState<Food | undefined>(undefined)
  const [pickerDefaults, setPickerDefaults] = useState<{ servingLabel: string; quantity: number }>({
    servingLabel: '',
    quantity: 1,
  })
  const [pickerEntry, setPickerEntry] = useState<FoodLogEntry | undefined>(undefined)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const results = useMemo(() => (query.trim() ? searchFoods(query) : []), [query])
  const grouped = groupEntriesBySlot(entries)

  function openPickerForFood(food: Food) {
    setPickerEntry(undefined)
    setPickerFood(food)
    setPickerDefaults({ servingLabel: food.servings[0]?.label ?? '', quantity: 1 })
  }

  function openPickerForEntry(entry: FoodLogEntry) {
    const food = entry.foodId ? getFoodById(entry.foodId) : undefined
    if (!food) {
      // Quick-add or otherwise unresolvable entries have no serving options to
      // adjust — one tap re-logs them exactly as they were.
      logAgain(entry)
      return
    }
    setPickerEntry(entry)
    setPickerFood(food)
    setPickerDefaults({ servingLabel: entry.servingLabel, quantity: entry.quantity })
  }

  function closePicker() {
    setPickerFood(undefined)
    setPickerEntry(undefined)
  }

  function confirmPicker(servingLabel: string, quantity: number) {
    if (!pickerFood) return
    const totals = resolveServingTotals(pickerFood, servingLabel, quantity)
    logFood({
      slot: pickerEntry?.slot ?? inferSlotFromTime(),
      foodId: pickerFood.id,
      name: pickerFood.name,
      servingLabel,
      quantity,
      kcal: totals.kcal,
      proteinG: totals.proteinG,
    })
  }

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-bold">Log food</h2>
        </div>

        {recents.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1 px-1 text-label font-medium text-ink-500">
              <Clock3 size={14} aria-hidden="true" />
              Recents — tap to log again
            </p>
            <div className="grid grid-cols-2 gap-2">
              {recents.map((entry) => (
                <button
                  key={`${entry.name}::${entry.servingLabel}`}
                  type="button"
                  onClick={() => openPickerForEntry(entry)}
                  className="flex min-h-[48px] flex-col items-start gap-0.5 rounded-chip bg-white p-3 text-left transition-colors duration-200 active:bg-cream-deep"
                >
                  <span className="font-body text-[15px] font-bold leading-snug">{entry.name}</span>
                  <span className="numerals text-label font-medium text-ink-500">
                    {entry.servingLabel} · {entry.kcal} kcal
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="food-search" className="mb-2 block text-label font-bold">
            Search foods
          </label>
          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              id="food-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. chicken adobo"
              className="min-h-[48px] w-full rounded-chip border-2 border-cream-edge bg-white py-3 pl-11 pr-4"
            />
          </div>
        </div>

        {query.trim() && (
          <div className="space-y-2">
            {results.length === 0 && (
              <p className="px-1 text-[15px] font-medium text-ink-500">
                Nothing found — try Quick add below instead.
              </p>
            )}
            {results.slice(0, 8).map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => openPickerForFood(food)}
                className="flex w-full min-h-[48px] items-center justify-between rounded-chip bg-white p-4 text-left transition-colors duration-200 active:bg-cream-deep"
              >
                <span className="font-body text-[15px] font-bold leading-snug">{food.name}</span>
                <span className="numerals text-label font-medium text-ink-500">
                  {Math.round((food.per100g.kcal * food.servings[0].grams) / 100)} kcal
                </span>
              </button>
            ))}
          </div>
        )}

        <Button variant="secondary" className="w-full gap-2" onClick={() => setShowQuickAdd(true)}>
          <Plus size={18} aria-hidden="true" />
          Quick add calories
        </Button>
      </section>

      {grouped.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 font-display text-lg font-bold">Today&rsquo;s log</h2>
          {grouped.map(({ slot, entries: slotEntries }) => (
            <Card key={slot} tone={SLOT_TONES[slot]}>
              <Pill className="bg-ink-900/10">{SLOT_LABELS[slot]}</Pill>
              <ul className="mt-3 space-y-2">
                {slotEntries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block font-body text-[15px] font-bold leading-snug">{entry.name}</span>
                      <span className={`numerals text-label font-medium ${TONE_MUTED[SLOT_TONES[slot]]}`}>
                        {entry.servingLabel} · {entry.quantity}x · {entry.kcal} kcal
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.name} from today's log`}
                      onClick={() => entry.id !== undefined && removeEntry(entry.id)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-900/10 text-ink-900 transition-colors duration-200 active:bg-ink-900/20"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>
      )}

      <LogFoodModal
        key={pickerFood ? `${pickerFood.id}::${pickerEntry?.id ?? 'new'}` : 'none'}
        open={!!pickerFood}
        onClose={closePicker}
        food={pickerFood}
        initialServingLabel={pickerDefaults.servingLabel}
        initialQuantity={pickerDefaults.quantity}
        onConfirm={confirmPicker}
      />

      <QuickAddModal
        key={String(showQuickAdd)}
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onConfirm={(kcal, proteinG) =>
          logFood({
            slot: inferSlotFromTime(),
            foodId: undefined,
            name: 'Quick add',
            servingLabel: 'quick add',
            quantity: 1,
            kcal,
            proteinG,
          })
        }
      />
    </div>
  )
}
