import { defineCard } from "../define.js";

export default defineCard({
  name: "Swirling Sandstorm",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Threshold — Swirling Sandstorm deals 5 damage to each creature without flying if there are seven or more cards in your graveyard.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 5 },
  },
});
