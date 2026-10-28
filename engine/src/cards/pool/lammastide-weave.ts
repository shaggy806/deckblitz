import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 30880. The milled card's mana value is read in the graveyard
// it went to; nothing milled with the name is no life gained at all.

export default defineCard({
  name: "Lammastide Weave",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose a card name, then target player mills a card. If a card with the chosen name was milled this way, you gain life equal to its mana value.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-card-name",
        aim: "opponent-library",
        then: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: 0, amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "milled", filter: { hasName: CHOSEN_CARD_NAME } },
              then: {
                kind: "gain-life",
                amount: { thisWay: "milled", filter: { hasName: CHOSEN_CARD_NAME }, sumOf: "mana-value" },
              },
            },
          ],
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
