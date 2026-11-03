import { defineCard } from "../define.js";

// EDHREC rank 31654.
//
// Rulings:
//   [2004-10-04] It does not remove Landwalk from creatures. It just makes creatures with landwalk
//     blockable as if they did not have the ability.

export default defineCard({
  name: "Staff of the Ages",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Creatures with landwalk abilities can be blocked as though they didn't have those abilities.",
  static: [
    {
      affects: { scope: "self" },
      // Every landwalk: the keywords of subtypes.ts's LANDWALK, and "landwalk"
      // for the kinds that have none (nonbasic, artifact, a chosen Gate).
      blockableDespiteLandwalk: ["plainswalk", "islandwalk", "swampwalk", "mountainwalk", "forestwalk", "desertwalk", "landwalk"],
      text: "Creatures with landwalk abilities can be blocked as though they didn't have those abilities.",
    },
  ],
});
