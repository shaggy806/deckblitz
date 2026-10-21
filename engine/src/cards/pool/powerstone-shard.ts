import { defineCard } from "../define.js";

// EDHREC rank 15595. Dominaria.
//
// Rulings:
//   [2018-04-27] Powerstone Shard's activated ability is a mana ability. It doesn't use the stack
//     and can't be responded to.

const TEXT = "{T}: Add {C} for each artifact you control named Powerstone Shard.";

export default defineCard({
  name: "Powerstone Shard",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { countOf: { type: "artifact", name: "Powerstone Shard", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
