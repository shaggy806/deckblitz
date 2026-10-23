import { defineCard } from "../define.js";

export default defineCard({
  name: "Liliana's Indignation",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Mill X cards. Target player loses 2 life for each creature card put into your graveyard this way.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: "x" },
      {
        kind: "lose-life",
        amount: { product: [{ thisWay: "put-into-graveyard", filter: { type: "creature" } }, 2] },
        target: 0,
      },
    ],
  },
});
