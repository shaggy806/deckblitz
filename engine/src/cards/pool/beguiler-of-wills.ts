import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 12065.
//
// Rulings:
//   [2012-05-01] The control-changing effect lasts indefinitely, even if the power of the
//     creature becomes greater than the number of creatures you control after the ability
//     resolves.
//   [2012-05-01] The comparison is made again when the ability resolves. If the power is greater
//     than the number of creatures you control at that time, the target is illegal and the
//     ability doesn't resolve.
//
// Legacy's Allure's shape: the power bound is part of the target filter, so it
// is checked again as the ability resolves (rule 608.2b).

const TEXT = "{T}: Gain control of target creature with power less than or equal to the number of creatures you control.";

export default defineCard({
  name: "Beguiler of Wills",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            power: { op: "lte", n: { amount: { countOf: { type: "creature", controlledBy: "you" } } } },
          },
        },
      ],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: TEXT,
    },
  ],
});
