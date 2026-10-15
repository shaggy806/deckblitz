import { defineCard } from "../define.js";

// Rulings:
//   The intervening "if" is checked as your end step starts (or the ability
//   doesn't trigger at all) and again as it resolves (rule 603.4 — the
//   trigger's `condition`). It counts this creature too, if it's tapped.

const TEXT =
  "At the beginning of your end step, if you control two or more tapped creatures, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Frontline War-Rager",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
