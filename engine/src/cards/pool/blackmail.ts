import { defineCard } from "../define.js";

export default defineCard({
  name: "Blackmail",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals three cards from their hand and you choose one of them. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, reveals: 3 },
});
