import { defineCard } from "../define.js";

export default defineCard({
  name: "Lumbering Megasloth",
  manaCost: "{10}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sloth", "Mutant"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { allCounters: true },
  },
  text: "This spell costs {1} less to cast for each counter among players and permanents.\nTrample\nThis creature enters tapped.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});
