import { defineCard } from "../define.js";

// EDHREC rank 23813. Patient Rebuilding's "this way" count, of creature cards.

export default defineCard({
  name: "Coerced Confession",
  manaCost: "{4}{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target player mills four cards. You draw a card for each creature card put into their graveyard this way.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: 4 },
      { kind: "draw", amount: { countInGraveyard: { thisWay: "milled", type: "creature" } } },
    ],
  },
});
