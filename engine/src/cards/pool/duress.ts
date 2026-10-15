import { defineCard } from "../define.js";

// EDHREC rank 3257.

export default defineCard({
  name: "Duress",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["creature", "land"] } },
});
