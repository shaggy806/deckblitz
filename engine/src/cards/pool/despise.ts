import { defineCard } from "../define.js";

// EDHREC rank 16152.
// The Cruelty of Gix's chapter I, as a spell.

export default defineCard({
  name: "Despise",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a creature or planeswalker card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["creature", "planeswalker"] } },
});
