import { defineCard } from "../define.js";

// EDHREC rank 30460. Formidable's activation
// condition (Dragon-Scarred Bear's) on a `block-if-able` requirement naming
// this creature as the attacker (Rampant Elephant's shape).

const FORMIDABLE =
  "Formidable — {2}{G}: Target creature blocks this creature this turn if able. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Lurking Arynx",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 5,
  text: FORMIDABLE,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0, attacker: "source" },
      resolve: null,
      text: FORMIDABLE,
    },
  ],
});
