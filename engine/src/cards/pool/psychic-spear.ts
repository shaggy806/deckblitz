import { defineCard } from "../define.js";

export default defineCard({
  name: "Psychic Spear",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a Spirit or Arcane card from it. That player discards that card.",
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] },
  },
});
