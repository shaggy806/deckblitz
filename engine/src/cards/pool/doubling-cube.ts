import { defineCard } from "../define.js";

const TEXT = "{3}, {T}: Double the amount of each type of unspent mana you have.";
const addMore = (mana: "W" | "U" | "B" | "R" | "G" | "C") =>
  ({ kind: "add-mana", mana, amount: { unspentMana: "you", type: mana } }) as const;

// EDHREC rank 3454. Each type adds as much again as the pool holds, the {3} of
// the cost already gone. What's added is plain mana: rule 106.6's example has
// the restricted {R}{G} stay restricted and the new {R}{G} spend on anything.
export default defineCard({
  name: "Doubling Cube",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [addMore("W"), addMore("U"), addMore("B"), addMore("R"), addMore("G"), addMore("C")],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
