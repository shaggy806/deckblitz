import { defineCard } from "../define.js";

// EDHREC rank 18705.
//
// Rulings:
//   [2004-10-04] The ability does trigger when it taps to attack.

const TEXT = "Whenever this creature becomes tapped, it deals 1 damage to any target.";

export default defineCard({
  name: "Goblin Medics",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
