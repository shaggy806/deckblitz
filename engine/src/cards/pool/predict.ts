import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// The name first, then the mill, then the draw read off what was milled.
const TEXT =
  "Choose a card name, then target player mills a card. If a card with the chosen name was milled this way, you " +
  "draw two cards. Otherwise, you draw a card.";

export default defineCard({
  name: "Predict",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    aim: "opponent-library",
    then: {
      kind: "sequence",
      effects: [
        { kind: "mill", target: 0, amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "milled", filter: { hasName: CHOSEN_CARD_NAME } },
          then: { kind: "draw", amount: 2 },
          else: { kind: "draw", amount: 1 },
        },
      ],
    },
  },
});
