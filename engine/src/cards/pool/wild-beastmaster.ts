import { defineCard } from "../define.js";

// EDHREC rank 8619.
//
// Rulings:
//   [2012-10-01] The value of X is determined when the triggered ability resolves. If Wild
//     Beastmaster is no longer on the battlefield at that time, use its last known power to
//     determine the value of X.
//   [2017-07-14] If this creature's power is negative as its ability resolves, X is considered to
//     be 0.
//
// Captain America, Wings of Freedom's shape. `powerOf: "source"` reads last-known power once it
// has left, and the amount is clamped at 0 (rule 107.1b).

export default defineCard({
  name: "Wild Beastmaster",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature attacks, each other creature you control gets +X/+X until end of turn, where X is this creature's power.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever this creature attacks, each other creature you control gets +X/+X until end of turn, where X is this creature's power.",
    },
  ],
});
