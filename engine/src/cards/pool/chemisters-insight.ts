import { defineCard } from "../define.js";

// EDHREC rank 8106.

export default defineCard({
  name: "Chemister's Insight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{3}{U}", discard: 1, keyword: "jump-start" },
  text: "Draw two cards.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  effect: { kind: "draw", amount: 2 },
});
