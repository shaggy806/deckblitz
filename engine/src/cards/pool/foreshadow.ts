import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 29137. The name is chosen on resolution (the ruling), before
// the mill; the delayed draw happens whatever was milled.

export default defineCard({
  name: "Foreshadow",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose a card name, then target opponent mills a card. If a card with the chosen name was milled this way, you draw a card.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["opponent"],
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
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
