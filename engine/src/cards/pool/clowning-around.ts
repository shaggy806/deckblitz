import { defineCard } from "../define.js";

// EDHREC rank 11652. The two Clown Robots are made first, so they count among
// the Robots the result is compared with.

export default defineCard({
  name: "Clowning Around",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create two 1/1 white Clown Robot artifact creature tokens, then roll a six-sided die. If the result is equal to or less than the number of Robots you control, create a 1/1 white Clown Robot artifact creature token.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Clown Robot Token", count: 2 },
      {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "conditional",
          condition: {
            kind: "amounts",
            left: { roll: "total" },
            op: "lte",
            right: { countOf: { subtype: "Robot", controlledBy: "you" } },
          },
          then: { kind: "create-token", token: "Clown Robot Token", count: 1 },
        },
      },
    ],
  },
});
