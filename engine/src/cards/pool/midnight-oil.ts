import { defineCard } from "../define.js";

// Kaladesh (KLD).The maximum hand size is read at cleanup (rule 514.1), from
// the hour counters on it then; the draw trigger still draws with none left
// to remove (the ruling).

const ENTERS = "This enchantment enters with seven hour counters on it.";
const DRAW =
  "At the beginning of your draw step, draw an additional card and remove two hour counters from this enchantment.";
const HAND = "Your maximum hand size is equal to the number of hour counters on this enchantment.";
const DISCARD = "Whenever you discard a card, you lose 1 life.";

export default defineCard({
  name: "Midnight Oil",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS}\n${DRAW}\n${HAND}\n${DISCARD}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "hour", amount: 7 } },
      text: ENTERS,
    },
    {
      affects: { scope: "self" },
      maxHandSize: { who: "you", set: { countersOnThis: "hour" } },
      text: HAND,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "remove-counter", target: "source", counter: "hour", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAW,
    },
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
