import { defineCard } from "../define.js";

// Dissension.
const DRAIN = "{2}{B}, Discard a card: Target opponent loses 1 life and you gain 1 life.";
const HELLBENT = "Hellbent — {1}, Pay 2 life: Draw a card. Activate only if you have no cards in hand.";

export default defineCard({
  name: "Nihilistic Glee",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DRAIN}\n${HELLBENT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, discard: { count: 1 } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
    {
      cost: { mana: "{1}", tap: false, payLife: 2 },
      condition: { kind: "hand-size", atMost: 0 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: HELLBENT,
    },
  ],
});
