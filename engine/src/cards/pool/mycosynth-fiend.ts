import { defineCard } from "../define.js";

export default defineCard({
  name: "Mycosynth Fiend",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 2,
  text: "This creature gets +1/+1 for each poison counter your opponents have.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { playerCounters: "poison", playerCountersOf: "opponents", pt: [1, 1] },
      text: "This creature gets +1/+1 for each poison counter your opponents have.",
    },
  ],
});
