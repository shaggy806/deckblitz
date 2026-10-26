import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 19129. Storm Seeker's shape.

export default defineCard({
  name: "Sudden Impact",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Sudden Impact deals damage to target player equal to the number of cards in that player's hand.",
  targets: ["player"],
  effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
});
