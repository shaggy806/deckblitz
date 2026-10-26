import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] You can target an artifact with Argent Mutation. When it resolves, you'll simply
//     draw a card.
//   [2011-06-01] If the permanent is an illegal target when Argent Mutation tries to resolve, it
//     won't resolve and none of its effects will happen. You won't draw a card.

export default defineCard({
  name: "Argent Mutation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target permanent becomes an artifact in addition to its other types until end of turn.\nDraw a card.",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
