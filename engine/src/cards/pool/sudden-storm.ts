import { defineCard } from "../define.js";

// EDHREC rank 26542. "Doesn't untap" follows the creature to whoever controls
// it at the next untap step, and an already-tapped target is held too (its
// rulings, `tap`'s `doesntUntapNext`). With no targets chosen it just scries.

export default defineCard({
  name: "Sudden Storm",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to two target creatures. Those creatures don't untap during their controllers' next untap steps. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
      { kind: "scry", amount: 1 },
    ],
  },
});
