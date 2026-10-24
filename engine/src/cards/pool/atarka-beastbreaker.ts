import { defineCard } from "../define.js";

// EDHREC rank 29858.
//
// Rulings:
//   [2015-02-25] Some formidable abilities are activated abilities that require creatures you
//     control to have total power 8 or greater. Once you activate these abilities, it doesn't
//     matter what happens to the total power of creatures you control.

const TEXT =
  "Formidable — {4}{G}: This creature gets +4/+4 until end of turn. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Atarka Beastbreaker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
