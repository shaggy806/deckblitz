import { defineCard } from "../define.js";

// EDHREC rank 8637.

export default defineCard({
  name: "Radical Idea",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{1}{U}", discard: 1, keyword: "jump-start" },
  text: "Draw a card.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  effect: { kind: "draw", amount: 1 },
});
