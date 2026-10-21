import { defineCard } from "../define.js";

// EDHREC rank 30821.
//
// Rulings:
//   [2004-10-04] In a multi-player game, it affects all opponents.

const TEXT = "Whenever a Mountain an opponent controls becomes tapped, you gain 1 life.";

export default defineCard({
  name: "Lifeblood",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { subtype: "Mountain", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
