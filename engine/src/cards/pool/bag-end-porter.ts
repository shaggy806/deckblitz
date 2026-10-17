import { defineCard } from "../define.js";

// EDHREC rank 22515.
//
// Rulings:
//   [2023-06-16] The value of X is determined only as Bag End Porter's triggered ability resolves.
//     It won't change later in the turn if the number of legendary creatures you control changes.

const LEGENDS = { countOf: { type: "creature", supertype: "legendary", controlledBy: "you" } } as const;
const TEXT =
  "Whenever this creature attacks, it gets +X/+X until end of turn, where X is the number of legendary creatures you control.";

export default defineCard({
  name: "Bag End Porter",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: LEGENDS, toughness: LEGENDS, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
