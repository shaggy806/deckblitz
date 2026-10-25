import { defineCard } from "../define.js";

// EDHREC rank 22701.
//
// Rulings:
//   [2014-11-24] You can’t cast Cunning Strike unless you target both a creature and a player. If
//     one target (but not both) is illegal as Cunning Strike resolves, it deals damage to the
//     remaining legal target and you draw a card. If both targets are illegal, the spell won’t
//     resolve and none of its effects will happen. You won’t draw a card in that case.

export default defineCard({
  name: "Cunning Strike",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Cunning Strike deals 2 damage to target creature and 2 damage to target player or planeswalker.\nDraw a card.",
  targets: ["creature", "player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
