import { defineCard } from "../define.js";

// EDHREC rank 27558.
//
// Rulings:
//   - The division is announced as it's cast; each chosen target must receive
//     at least 1 damage.
//   - If some but not all targets are illegal as it resolves, the rest are
//     dealt damage by the original division.
//
// Explosive Crystal's shape, over creatures only.

export default defineCard({
  name: "Spreading Flames",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Spreading Flames deals 6 damage divided as you choose among any number of target creatures.",
  targets: [{ kind: "any-number", of: "creature", max: 6 }],
  divided: { total: 6, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
