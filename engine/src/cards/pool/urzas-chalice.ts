import { defineCard } from "../define.js";

// EDHREC rank 24160.
//
// Rulings:
//   This will not trigger on its own casting. It must be on the battlefield
//   at the time the artifact is cast.

const TEXT = "Whenever a player casts an artifact spell, you may pay {1}. If you do, you gain 1 life.";

export default defineCard({
  name: "Urza's Chalice",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to gain 1 life?",
        cost: "{1}",
        effect: { kind: "gain-life", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
