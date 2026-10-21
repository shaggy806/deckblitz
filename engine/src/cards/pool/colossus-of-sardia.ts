import { defineCard } from "../define.js";

// EDHREC rank 23254.
//
// Rulings:
//   [2008-05-01] The ability that untaps it during your upkeep has been returned to an activated
//     ability. There is no restriction on how many times it can be untapped during your upkeep
//     with this ability.

export default defineCard({
  name: "Colossus of Sardia",
  manaCost: "{9}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 9,
  toughness: 9,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nThis creature doesn't untap during your untap step.\n{9}: Untap this creature. Activate only during your upkeep.",
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: "This creature doesn't untap during your untap step." }],
  activated: [
    {
      cost: { mana: "{9}", tap: false },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "{9}: Untap this creature. Activate only during your upkeep.",
    },
  ],
});
