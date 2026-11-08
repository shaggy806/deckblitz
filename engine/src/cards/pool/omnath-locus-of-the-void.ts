import { defineCard } from "../define.js";

const SIZE_TEXT = "Omnath gets +1/+1 for each unspent mana you have.";
const LOSE_TEXT = "If you would lose unspent mana, that mana becomes colorless instead.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, add {C}{C}.";

// EDHREC rank 8448. A size read off the pool (rule 106.4), and Kruphix's
// replacement: the mana stays in the pool from step to step, colourless, with
// its restrictions and riders (the rulings). The landfall ability isn't a mana
// ability (rule 605.5a): it triggers from something else, so it uses the stack.
export default defineCard({
  name: "Omnath, Locus of the Void",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  text: `${SIZE_TEXT}\n${LOSE_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    { affects: { scope: "self" }, grantPtPerCount: { unspentMana: {}, pt: [1, 1] }, text: SIZE_TEXT },
    { affects: { scope: "self" }, unspentManaBecomes: "C", text: LOSE_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 2 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
