import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// The revealed card is the one drawn (the ruling): it's still on top. A
// double-faced card is asked of the card itself, whichever kind (712.1).

const ENTER_TEXT =
  "When this Siege enters, scry 3, then reveal the top card of your library. If it's a land or double-faced card, draw a card.";

export default defineCard({
  name: "Invasion of Pyrulea",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "scry",
        amount: 3,
        then: {
          kind: "reveal-top",
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { anyOf: [{ type: "land" }, { doubleFaced: true }] } },
            then: { kind: "draw", amount: 1 },
          },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Pyrulea", "Gargantuan Slabhorn"],
  transform: true,
});
