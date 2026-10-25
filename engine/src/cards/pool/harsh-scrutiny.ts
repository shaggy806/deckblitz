import { defineCard } from "../define.js";

// EDHREC rank 20786. You scry 1 even if there's no creature card to discard
// (the ruling).

export default defineCard({
  name: "Harsh Scrutiny",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a creature card from it. That player discards that card. Scry 1.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { type: "creature" } },
      { kind: "scry", amount: 1 },
    ],
  },
});
