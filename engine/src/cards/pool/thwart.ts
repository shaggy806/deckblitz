import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 15488.
//
// "You may return three Islands you control to their owner's hand rather
// than pay this spell's mana cost" is an alternative cost (rule 118.9):
// `alternativeCost.returnToHand`, the Islands chosen as the cost is paid
// (601.2h). Islands tapped for mana first may be among them.

export default defineCard({
  name: "Thwart",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may return three Islands you control to their owner's hand rather than pay this spell's mana cost.\nCounter target spell.",
  alternativeCost: {
    mana: "{0}",
    returnToHand: { filter: { type: "land", subtype: "Island" }, count: 3, text: "three Islands you control" },
  },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
