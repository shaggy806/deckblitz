import { defineCard } from "../define.js";

// EDHREC rank 8391.
//
// Rulings:
//   [2021-07-23] A creature is a legal target for Power Word Kill if it doesn't have any of these
//     four creature types. If it has one of these four creature types, it's not a legal target,
//     even if it also has a creature type that's not among these four. For example, a Demon Rogue
//     is not a valid target for this spell.

export default defineCard({
  name: "Power Word Kill",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target non-Angel, non-Demon, non-Devil, non-Dragon creature.",
  targets: [
    { kind: "permanent", filter: { type: "creature", notSubtypes: ["Angel", "Demon", "Devil", "Dragon"] } },
  ],
  effect: { kind: "destroy", target: 0 },
});
