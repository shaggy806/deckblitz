import { defineCard } from "../define.js";

/** 3/1 red Elemental, trample, haste, sacrificed at end step — Sparkspitter's token. */
export default defineCard({
  name: "Spark Elemental Token",
  art: "b1270173-72fc-489a-beef-85e2d8096bd7",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nAt the beginning of the end step, sacrifice Spark Elemental.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice Spark Elemental.",
    },
  ],
});
