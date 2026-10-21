import { defineCard } from "../define.js";

// EDHREC rank 9259.

export default defineCard({
  name: "Skewer the Critics",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{R}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {R} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nSkewer the Critics deals 3 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
