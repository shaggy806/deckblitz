import { defineCard } from "../define.js";
import { flipUntilLose } from "../helpers.js";

const TEXT =
  "Choose a number. Flip a coin that many times or until you lose a flip, whichever comes first. If you win all the " +
  "flips, draw two cards for each flip.";

export default defineCard({
  name: "Squee's Revenge",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-value",
    value: "number",
    min: 0,
    max: 20,
    then: {
      kind: "sequence",
      effects: [
        flipUntilLose({ times: "x" }),
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "flips-lost", atMost: 0 },
          then: { kind: "draw", amount: { product: [{ thisWay: "flips-won" }, 2] } },
        },
      ],
    },
  },
});
