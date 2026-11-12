import { defineCard } from "../define.js";

// EDHREC rank 14576. A result of 0 or less scries nothing (its ruling).

export default defineCard({
  name: "Boing!",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand, then roll a six-sided die. If the result is 3 or less, scry a number of cards equal to the result.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "conditional",
          condition: { kind: "amounts", left: { roll: "total" }, op: "lte", right: 3 },
          then: { kind: "scry", amount: { roll: "total" } },
        },
      },
    ],
  },
});
