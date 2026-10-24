import { defineCard } from "../define.js";

// EDHREC rank 12899.
//
// Rulings:
//   [2015-02-25] If you control a creature with power less than 0, use its actual power when
//     calculating the total power of creatures you control.
//   [2015-02-25] Some formidable abilities are activated abilities that require creatures you
//     control to have total power 8 or greater. Once you activate these abilities, it doesn’t
//     matter what happens to the total power of creatures you control.

const TEXT =
  "Formidable — {1}{G}: Regenerate this creature. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Dragon-Scarred Bear",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
