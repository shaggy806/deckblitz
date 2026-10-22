import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 18991.
//
// A mana ability (rule 605.1a): no target, it adds mana, and its effect moves
// no card to or from a library — the draw is a delayed triggered ability's,
// later. So the delayed trigger rides on the mana (`add-mana`'s `also`, as
// Rainbow Vale's does), set up as the mana is added, without the stack.

const TEXT =
  "{1}, {T}, Sacrifice this artifact: Add one mana of any color. Draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Barbed Sextant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
