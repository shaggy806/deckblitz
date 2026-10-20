import { defineCard } from "../define.js";

// EDHREC rank 16177.
//
// Rulings:
//   [2020-09-25] The power of the target creature and the number of Warriors you control are
//     checked only as Goma Fada Vanguard's ability is put onto the stack and as that ability
//     resolves. If the creature's power becomes greater after the ability has resolved, it still
//     can't block.
//   [2020-09-25] The target creature is restricted from blocking anything, not just Goma Fada
//     Vanguard.

const ATTACK_TEXT =
  "Whenever this creature attacks, target creature an opponent controls with power less than or equal to the number of Warriors you control can't block this turn.";

export default defineCard({
  name: "Goma Fada Vanguard",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: {
            type: "creature",
            power: { op: "lte", n: { amount: { countOf: { subtype: "Warrior", controlledBy: "you" } } } },
          },
        },
      ],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
