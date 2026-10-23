import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 27558.
//
// Chandra's Pyrohelix's shape over creatures: the division is announced as
// it's cast, at least 1 to each target, and a target that becomes illegal
// just isn't dealt its share (the rulings).
export default defineCard({
  name: "Spreading Flames",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Spreading Flames deals 6 damage divided as you choose among any number of target creatures.",
  targets: [{ kind: "any-number", of: "creature", min: 1, max: 6 }],
  divided: { total: 6, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
