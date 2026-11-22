import { defineCard } from "../define.js";

// Midnight Hunt Commander (MIC). EDHREC rank 18991.
//
// The powers are read as it resolves, one slot each, lowest first; a power
// only one creature has picks it unasked. Every creature is chosen from,
// whoever controls it, and the ones not chosen are destroyed at once.
export default defineCard({
  name: "Celestial Judgment",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "For each different power among creatures on the battlefield, choose a creature with that power. Destroy each creature not chosen this way.",
  targets: [],
  effect: {
    kind: "choose-for-each-slot",
    slots: "powers",
    filter: { type: "creature" },
    prompt: "Choose a creature with power {slot} — it isn't destroyed",
    rest: "destroy",
  },
});
