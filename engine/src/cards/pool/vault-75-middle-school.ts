import { defineCard } from "../define.js";

// EDHREC rank 9343. Fallout.
//
// Chapter I exiles every creature with power 4 or greater, yours included.
const I_TEXT = "I — Exile all creatures with power 4 or greater.";
const II_III_TEXT = "II, III — Put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Vault 75: Middle School",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "exile-all", filter: { type: "creature", power: { op: "gte", n: 4 } } },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: II_III_TEXT,
    },
  ],
});
