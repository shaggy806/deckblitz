import { defineCard } from "../define.js";

// EDHREC rank 13598.
//
// Rulings:
//   - If the target creature is an illegal target as it tries to resolve, it
//     doesn't resolve: you don't draw a card.
//   - Once an Assassin creature or commander you control deals combat damage to
//     a player in a turn, you can cast spells for their freerunning costs for
//     the rest of that turn, whatever happens to that creature after.
//
// - Freerunning with no mana (rule 702.173a): `cost: "{0}"` and the return as
//   its `also` — Veil of Secrecy's alternative cost's return, paid once the
//   spell is on the stack (601.2h), offered only while there's a blue creature
//   to return.
// - The returned creature may be the one it targets: targets are chosen before
//   costs are paid (601.2c, 601.2h), and a target gone by resolution leaves the
//   spell with no legal target, so it does nothing (608.2b).
export default defineCard({
  name: "Escape Detection",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Freerunning—Return a blue creature you control to its owner's hand. (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nReturn target creature to its owner's hand.\nDraw a card.",
  freerunning: {
    cost: "{0}",
    also: {
      text: "Return a blue creature you control to its owner's hand",
      returnToHand: { filter: { type: "creature", colors: ["U"] }, count: 1 },
    },
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
