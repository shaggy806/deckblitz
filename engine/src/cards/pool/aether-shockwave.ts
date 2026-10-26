import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 16946.
//
// Rulings:
//   [2005-06-01] You choose the mode on announcement.
//
// The mode is chosen as it's cast (`castModal`, rule 700.2a). "All Spirits" is every Spirit
// permanent, not only creatures.

export default defineCard({
  name: "Aether Shockwave",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Tap all Spirits.\n• Tap all non-Spirit creatures.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Tap all Spirits.", targets: [], effect: { kind: "tap-all", filter: { subtype: "Spirit" } } },
      {
        text: "Tap all non-Spirit creatures.",
        targets: [],
        effect: { kind: "tap-all", filter: { type: "creature", notSubtypes: ["Spirit"] } },
      },
    ],
  },
});
