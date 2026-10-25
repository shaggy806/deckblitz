import { defineCard } from "../define.js";

// Alliances. EDHREC rank 26110.
//
// Barbed Sextant's shape: a mana ability (rule 605.1a — no target, and the
// draw is a delayed trigger's, later), so the delayed trigger rides on the
// mana (`add-mana`'s `also`). Two mana of any one colour is `amount: 2`.

const TEXT =
  "{1}, {T}, Sacrifice this artifact: Add two mana of any one color. Draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Astrolabe",
  manaCost: "{3}",
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
        amount: 2,
        also: { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
