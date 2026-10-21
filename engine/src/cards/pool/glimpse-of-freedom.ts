import { defineCard } from "../define.js";

// EDHREC rank 19702.

export default defineCard({
  name: "Glimpse of Freedom",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card.\nEscape—{2}{U}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: [],
  effect: { kind: "draw", amount: 1 },
  escape: { cost: "{2}{U}", exileCount: 5 },
});
