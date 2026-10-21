import { defineCard } from "../define.js";

// Addendum, as Return to Dust reads it: asked as the spell resolves — a spell
// cast in a main phase resolves in that phase — and a copy wasn't cast (the
// rulings). An illegal target means no draw: the spell doesn't resolve.
export default defineCard({
  name: "Arrester's Admonition",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand.\nAddendum — If you cast this spell during your main phase, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
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
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
