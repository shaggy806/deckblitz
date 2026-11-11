import { defineCard } from "../define.js";

// EDHREC rank 5696.
//
// Rulings:
//   Roar of Resistance's last ability triggers whenever any creatures attack, not just whenever
//     creatures you control attack.

// One trigger for a whole declaration, any player's. The creatures that get
// +2/+0 are the ones attacking an opponent of yours, or a planeswalker one
// controls, as the ability resolves (rule 611.2c) — whoever controls them, and
// never one attacking you, a planeswalker of yours or a battle.
const HASTE = "Creature tokens you control have haste.";
const ROAR =
  "Whenever one or more creatures attack, you may pay {1}{R}. If you do, creatures attacking your opponents and/or planeswalkers they control get +2/+0 until end of turn.";

export default defineCard({
  name: "Roar of Resistance",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${HASTE}\n${ROAR}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: HASTE,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "any" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{R} to give creatures attacking your opponents and/or planeswalkers they control +2/+0 until end of turn?",
        cost: "{1}{R}",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", attackingOpponent: "or-their-planeswalkers" },
          power: 2,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ROAR,
    },
  ],
});
