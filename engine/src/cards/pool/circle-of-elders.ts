import { defineCard } from "../define.js";

// EDHREC rank 23700. Formidable as an activation condition (rule 602.5b):
// checked only as it's activated (the ruling).
const MANA_TEXT = "Formidable — {T}: Add {C}{C}{C}. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Circle of Elders",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 3 },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
