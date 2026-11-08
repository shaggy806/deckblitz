import { defineCard } from "../define.js";

// EDHREC rank 24060.
//
// `controllerOf` of a player is that player, of a planeswalker its
// controller: the creatures counted on a lost flip are theirs.
const TEXT =
  "Sacrifice this artifact: Flip a coin. If you win the flip, this artifact deals damage to target opponent or planeswalker equal to the number of creatures you control. If you lose the flip, this artifact deals damage to you equal to the number of creatures that opponent or that planeswalker's controller controls.";

export default defineCard({
  name: "Goblin Lyre",
  manaCost: "{3}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: {
        kind: "flip-coin",
        won: { kind: "damage", amount: { countOf: { type: "creature", controlledBy: "you" } }, target: 0 },
        lost: {
          kind: "damage",
          amount: { countOf: { type: "creature", controlledBy: "you" }, forPlayer: { controllerOf: 0 } },
          who: "you",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
