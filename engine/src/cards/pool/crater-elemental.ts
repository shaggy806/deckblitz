import { defineCard } from "../define.js";

// EDHREC rank 26733.
//
// Rulings:
//   [2015-02-25] Once you activate these abilities, it doesn't matter what happens to the total
//     power of creatures you control.
//   [2015-02-25] Crater Elemental's last ability overrides all previous effects that set its power
//     to a specific value.
//
// "Has base power 8" sets power alone (`animate` with no `toughness`, rule
// 613.4b); formidable is Atarka Beastbreaker's activation condition.
const SAC_TEXT = "{R}, {T}, Sacrifice this creature: It deals 4 damage to target creature.";
const FORMIDABLE_TEXT =
  "Formidable — {2}{R}: This creature has base power 8 until end of turn. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Crater Elemental",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 6,
  text: `${SAC_TEXT}\n${FORMIDABLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "animate", target: "source", power: 8, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
