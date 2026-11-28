import { defineCard } from "../define.js";
import { CHOSEN_COLOR } from "../../effects.js";

// EDHREC rank 29045. Urza's Destiny.
//
// The target opponent is chosen as it's activated; the number and the colour
// as it resolves (the ruling), the number first: `"x"` from the outer
// `choose-value` carries through the colour's. Then the opponent reveals their
// hand (701.20a) and the cards revealed this way of the chosen colour are
// counted — a multicoloured card that has it counts. Only the five colours can
// be chosen (the ruling).

const TEXT =
  "{3}, {T}: Choose a number greater than 0 and a color. Target opponent reveals their hand. If that opponent reveals exactly the chosen number of cards of the chosen color, you draw a card.";

export default defineCard({
  name: "Scrying Glass",
  manaCost: "{2}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "choose-value",
        value: "number",
        min: 1,
        then: {
          kind: "choose-value",
          value: "color",
          then: {
            kind: "sequence",
            effects: [
              { kind: "reveal-hand", who: 0 },
              {
                kind: "conditional",
                condition: {
                  kind: "amounts",
                  left: { thisWay: "revealed", filter: { colors: [CHOSEN_COLOR] } },
                  op: "eq",
                  right: "x",
                },
                then: { kind: "draw", amount: 1 },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
