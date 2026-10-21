import { defineCard } from "../define.js";

// EDHREC rank 22422.

export default defineCard({
  name: "Sweet Oblivion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player mills four cards.\nEscape—{3}{U}, Exile four other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: ["player"],
  effect: { kind: "mill", target: 0, amount: 4 },
  escape: { cost: "{3}{U}", exileCount: 4 },
});
