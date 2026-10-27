import { defineCard } from "../define.js";

export default defineCard({
  name: "Extortion",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at target player's hand and choose up to two cards from it. That player discards those cards.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, lookOnly: true, upTo: 2 },
});
