import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 18377.
//
// Rulings:
//   [2005-02-01] You must choose two different targets when you cast Toils of Night and Day. The
//     targets are chosen on announcement. The tap or untap choice is made on resolution.

export default defineCard({
  name: "Toils of Night and Day",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may tap or untap target permanent, then you may tap or untap another target permanent.",
  targets: ["permanent", { kind: "other", of: "permanent", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap the first permanent", effect: { kind: "tap", target: 0 } },
          { text: "Untap the first permanent", effect: { kind: "untap", target: 0 } },
        ],
      },
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap the second permanent", effect: { kind: "tap", target: 1 } },
          { text: "Untap the second permanent", effect: { kind: "untap", target: 1 } },
        ],
      },
    ],
  },
});
