import { useState } from 'react'

import { CountStepper } from './CountStepper.tsx'

/**
 * The banner's controls for a `choose-number` decision — "choose a number"
 * as a spell resolves (Void): a stepper from the offer's `min` (up to its
 * `max`, when the card bounds the choice), then Choose. Holds the number
 * until it's sent, so the parent keys it by the decision to start each one
 * afresh.
 */
export function NumberChoice({
  title,
  min,
  max,
  onChoose,
}: {
  /** What's asking, in words: "Void — choose a number". */
  readonly title: string
  readonly min: number
  readonly max?: number
  readonly onChoose: (n: number) => void
}) {
  const [count, setCount] = useState(min)
  return (
    <div className="controls">
      <span>{title}</span>
      <CountStepper
        label="Number"
        count={count}
        min={min}
        max={max ?? Number.MAX_SAFE_INTEGER}
        showMax={max !== undefined}
        onChange={setCount}
      />
      <button type="button" onClick={() => onChoose(count)}>
        Choose {count}
      </button>
    </div>
  )
}
