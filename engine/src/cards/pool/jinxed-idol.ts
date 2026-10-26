import { defineCard } from "../define.js";

// EDHREC rank 9491.
//
// Rulings:
//   [2004-10-04] Your opponent can use the ability to give this card back to you.
//   [2010-08-15] If you sacrifice an attacking or blocking creature during the declare blockers
//     step, it won't deal combat damage.
//   The control-change effect has no duration: the targeted player keeps it until the game ends,
//   it leaves the battlefield, or another effect gives it to someone else.

export default defineCard({
  name: "Jinxed Idol",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your upkeep, this artifact deals 2 damage to you.\nSacrifice a creature: Target opponent gains control of this artifact.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: "Sacrifice a creature: Target opponent gains control of this artifact.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, this artifact deals 2 damage to you.",
    },
  ],
});
