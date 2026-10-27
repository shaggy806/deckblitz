import { defineCard } from "../define.js";

/** 5/1 red Elemental named Lightning Rager — trample, haste, sacrificed at end step. Its name is
 * only Lightning Rager (Rite of the Raging Storm's ruling). */
export default defineCard({
  name: "Lightning Rager Token",
  tokenName: "Lightning Rager",
  art: "8292126c-a7b4-40d3-8a08-f15dd871207d",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nAt the beginning of the end step, sacrifice this token.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this token.",
    },
  ],
});
