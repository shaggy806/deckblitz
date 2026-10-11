import { defineCard } from "../define.js";

// Banned in Commander; in the pool for casual play.
//
// "Your commander" is the card designated as your deck's commander (rule
// 903.3) — one you own, wherever it's cast from, so either partner counts and
// an opponent's commander you happen to be casting doesn't. The mana pays any
// part of that spell's total cost, the commander tax included.

const MANA_TEXT =
  "{T}, Sacrifice this artifact: Add three mana of any one color. Spend this mana only to cast your commander.";

export default defineCard({
  name: "Jeweled Lotus",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 3,
        spendOnly: {
          spell: { isCommander: true, ownedBy: "you" },
          text: "Spend this mana only to cast your commander.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
