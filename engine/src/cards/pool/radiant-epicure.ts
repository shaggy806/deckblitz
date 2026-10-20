import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). Converge (rule 207.2c) — the colours spent to cast
// it, kept by the permanent it became; 0 when it entered without being cast
// or was cast for free (the rulings).
const TEXT =
  "Converge — When this creature enters, each opponent loses X life and you gain X life, where X is the number of colors of mana spent to cast this spell.";
const X = { colorsSpentOf: "source" } as const;

export default defineCard({
  name: "Radiant Epicure",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: X, who: "each-opponent" },
          { kind: "gain-life", amount: X },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
