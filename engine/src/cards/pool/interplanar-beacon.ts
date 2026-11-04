import { defineCard } from "../define.js";

// Rulings:
//   [2019-05-03] Both mana produced by the last ability may be spent on the same planeswalker
//     spell, or each may be spent on different planeswalker spells.
//   [2019-05-03] The first ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered.

const CAST = "Whenever you cast a planeswalker spell, you gain 1 life.";
const COLORLESS = "{T}: Add {C}.";
const PAIR = "{1}, {T}: Add two mana of different colors. Spend this mana only to cast planeswalker spells.";

export default defineCard({
  name: "Interplanar Beacon",
  manaCost: "",
  colors: [],
  types: ["land"],
  text: `${CAST}\n${COLORLESS}\n${PAIR}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "planeswalker" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: CAST,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: COLORLESS,
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"], different: 1 },
        amount: 2,
        spendOnly: { spell: { type: "planeswalker" }, text: "Spend this mana only to cast planeswalker spells." },
      },
      resolve: null,
      text: PAIR,
    },
  ],
});
