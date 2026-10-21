import { defineCard } from "../define.js";

// Addendum, as Return to Dust reads it: asked as the spell resolves — a spell
// cast in a main phase resolves in that phase — and a copy wasn't cast (the
// rulings).
export default defineCard({
  name: "Sphinx's Insight",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Draw two cards.\nAddendum — If you cast this spell during your main phase, you gain 2 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "your-turn" },
            { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
          ],
        },
        then: { kind: "gain-life", amount: 2 },
      },
    ],
  },
});
