import { defineCard } from "../define.js";

// EDHREC rank 24450.
//
// Rulings:
//   [2016-04-08] You can cast Clip Wings even if some (or all) of your opponents don't control a
//     creature with flying. Those who do must each choose a flying creature to sacrifice, and
//     those who don't are unaffected.

export default defineCard({
  name: "Clip Wings",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Each opponent sacrifices a creature of their choice with flying.",
  targets: [],
  effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature", keyword: "flying" }, count: 1 },
});
