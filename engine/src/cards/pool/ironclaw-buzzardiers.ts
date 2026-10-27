import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 31778. Ironclaw Orcs' blocking restriction.
//
// Rulings:
//   [2006-09-25] "Can't block" abilities apply only as blockers are declared. After Ironclaw
//     Buzzardiers blocks, increasing the blocked creature's power won't make it become unblocked.

export default defineCard({
  name: "Ironclaw Buzzardiers",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Scout"],
  power: 2,
  toughness: 2,
  text: "This creature can't block creatures with power 2 or greater.\n{R}: This creature gains flying until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { power: { op: "lte", n: 1 } },
      text: "This creature can't block creatures with power 2 or greater.",
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gains flying until end of turn.",
    },
  ],
});
