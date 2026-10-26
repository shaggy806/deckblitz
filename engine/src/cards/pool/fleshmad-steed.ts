import { defineCard } from "../define.js";

export default defineCard({
  name: "Fleshmad Steed",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 2,
  toughness: 2,
  text: "Whenever another creature dies, tap this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "tap", target: "source" },
      resolve: null,
      text: "Whenever another creature dies, tap this creature.",
    },
  ],
});
