import { defineCard } from "../define.js";

// Rulings:
//   - You may activate Boxing Ring's last ability if you control a creature that fought due to any
//     effect, not just a creature that fought in the Boxing Ring.
//   - If the only creature you controlled that fought this turn died due to that fight, you can't
//     activate Boxing Ring's last ability. Only winners get prizes!
//
// "With the same mana value" is the entering creature's, read when the target is chosen and again
// as the ability resolves. "A creature that fought this turn" is the journal's `fought` (rule
// 701.14a), each creature in the stint it fought in — one that died is gone (the second ruling).

export default defineCard({
  name: "Boxing Ring",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: "Whenever a creature you control enters, it fights up to one target creature you don't control with the same mana value.\n{T}: Create a Treasure token. Activate only if you control a creature that fought this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "permanent",
            whose: "opponent",
            filter: { type: "creature", manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
          },
        },
      ],
      effect: { kind: "fight", a: "trigger-object", b: 0 },
      resolve: null,
      text: "Whenever a creature you control enters, it fights up to one target creature you don't control with the same mana value.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "controls", filter: { type: "creature", journaled: { what: "fought" } }, atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{T}: Create a Treasure token. Activate only if you control a creature that fought this turn.",
    },
  ],
});
