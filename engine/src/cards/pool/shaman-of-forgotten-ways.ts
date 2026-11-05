import { defineCard } from "../define.js";

// Each player's new life total is the creatures they control as it
// resolves, a real gain or loss of the difference (rule 119.5); the power
// check is only to activate (the rulings).

const MANA_TEXT = "{T}: Add two mana in any combination of colors. Spend this mana only to cast creature spells.";
const FORMIDABLE_TEXT =
  "Formidable — {9}{G}{G}, {T}: Each player's life total becomes the number of creatures they control. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Shaman of Forgotten Ways",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: `${MANA_TEXT}\n${FORMIDABLE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: 2,
        spendOnly: { spell: { type: "creature" }, text: "Spend this mana only to cast creature spells." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{9}{G}{G}", tap: true },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: {
        kind: "set-life-total",
        who: "each-player",
        amount: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
      },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
