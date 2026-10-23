import { defineCard } from "../define.js";

// EDHREC rank 25625.
//
// Decision Paralysis's two optional slots, plus madness.

export default defineCard({
  name: "Chilling Grasp",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  madness: { cost: "{3}{U}" },
  text: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.\nMadness {3}{U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
    ],
  },
});
