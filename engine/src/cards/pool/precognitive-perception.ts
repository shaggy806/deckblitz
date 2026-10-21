import { defineCard } from "../define.js";

// EDHREC rank 15018. Addendum, as Return to Dust reads it: the spell was cast
// (a copy wasn't — the ruling) and it's resolving in your main phase, which
// is where a spell cast in your main phase resolves.

export default defineCard({
  name: "Precognitive Perception",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw three cards.\nAddendum — If you cast this spell during your main phase, instead scry 3, then draw three cards.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "source", filter: { cast: true } },
        { kind: "your-turn" },
        { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
      ],
    },
    then: { kind: "scry", amount: 3, then: { kind: "draw", amount: 3 } },
    else: { kind: "draw", amount: 3 },
  },
});
