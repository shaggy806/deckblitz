import { defineCard } from "../define.js";

// EDHREC rank 9075.
//
// Rulings:
//   [2006-05-01] In Two-Headed Giant, triggers only once per upkeep, not once for each player.

export default defineCard({
  name: "Awakening",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "At the beginning of each upkeep, untap all creatures and lands.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "untap-all", filter: { typesAnyOf: ["creature", "land"] } },
      resolve: null,
      text: "At the beginning of each upkeep, untap all creatures and lands.",
    },
  ],
});
