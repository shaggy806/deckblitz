import { defineCard } from "../define.js";

// EDHREC rank 25233.

export default defineCard({
  name: "Dark Inquiry",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
});
