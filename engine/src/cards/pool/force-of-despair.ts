import { defineCard } from "../define.js";

// EDHREC rank 2450.
//
// Rulings:
//   [2019-06-14] Force of Despair destroys all permanents that entered the battlefield this turn
//     and are currently creatures. It doesn’t matter whether they were creatures as they entered
//     the battlefield.

export default defineCard({
  name: "Force of Despair",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "If it's not your turn, you may exile a black card from your hand rather than pay this spell's mana cost.\nDestroy all creatures that entered this turn.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["B"] }, text: "a black card" }, condition: { kind: "not", of: { kind: "your-turn" } } },
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", enteredThisTurn: true } },
});
