import { defineCard } from "../define.js";

// EDHREC rank 23989.

export default defineCard({
  name: "Ostracize",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a creature card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { type: "creature" } },
});
