import { defineCard } from "../define.js";

// Any payment of life (rule 119.4) — a cost's, Phyrexian mana's, a shock
// land's, an "unless you pay N life" — and nothing that only loses life
// without the word "pay" (the card's rulings).
const PAY_TEXT = "Whenever you pay life, put that many blood counters on this enchantment.";
const DESTROY_TEXT = "{1}{B}, Remove four blood counters from this enchantment: Destroy target creature.";

export default defineCard({
  name: "Font of Agonies",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${PAY_TEXT}\n${DESTROY_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "pays-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "blood", amount: { triggerValue: true } },
      resolve: null,
      text: PAY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, removeCounter: { kind: "blood", count: 4 } },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
