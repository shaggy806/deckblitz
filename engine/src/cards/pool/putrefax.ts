import { defineCard } from "../define.js";

export default defineCard({
  name: "Putrefax",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 3,
  keywords: ["trample", "haste", "infect"],
  text: "Trample, haste\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nAt the beginning of the end step, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this creature.",
    },
  ],
});
