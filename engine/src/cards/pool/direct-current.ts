import { defineCard } from "../define.js";

// EDHREC rank 24997.

export default defineCard({
  name: "Direct Current",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{1}{R}{R}", discard: 1, keyword: "jump-start" },
  text: "Direct Current deals 2 damage to any target.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
