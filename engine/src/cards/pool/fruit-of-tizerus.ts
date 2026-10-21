import { defineCard } from "../define.js";

export default defineCard({
  name: "Fruit of Tizerus",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 2 life.\nEscape—{3}{B}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: ["player"],
  effect: { kind: "lose-life", amount: 2, target: 0 },
  escape: { cost: "{3}{B}", exileCount: 3 },
});
