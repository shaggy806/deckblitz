import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 24696.
//
// Rulings:
//   [2008-10-01] This has the supertype world. When a world permanent enters, any world permanents
//     that were already on the battlefield are put into their owners' graveyards. This is a
//     state-based action called the "world rule." The new world permanent stays on the
//     battlefield. If two world permanents enter at the same time, they're both put into their
//     owners' graveyards.

export default defineCard({
  name: "Serra Aviary",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: "Creatures with flying get +1/+1.",
  static: [
    {
      affects: { scope: "all-creatures", withKeyword: "flying" },
      grantPt: [1, 1],
      text: "Creatures with flying get +1/+1.",
    },
  ],
});
