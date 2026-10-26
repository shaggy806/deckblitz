import { defineCard } from "../define.js";

// EDHREC rank 31871.
//
// Rulings:
//   [2004-10-04] The -1/-1 penalty is given to all green creatures on the battlefield when the
//     triggered ability resolves. It will not apply to green creatures that enter later in the
//     turn.

const TEXT = "When this creature enters, green creatures get -1/-1 until end of turn.";

export default defineCard({
  name: "Rank and File",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", colors: ["G"] },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
