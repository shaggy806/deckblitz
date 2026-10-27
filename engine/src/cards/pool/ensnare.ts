import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 13908.
//
// "You may return two Islands you control to their owner's hand rather than
// pay this spell's mana cost" (rule 118.9, Gush's), the Islands chosen as
// the cost is paid (601.2h).

export default defineCard({
  name: "Ensnare",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may return two Islands you control to their owner's hand rather than pay this spell's mana cost.\nTap all creatures.",
  alternativeCost: {
    mana: "{0}",
    returnToHand: { filter: { type: "land", subtype: "Island" }, count: 2, text: "two Islands" },
  },
  effect: { kind: "tap-all", filter: { type: "creature" } },
});
