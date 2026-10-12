import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloistered Youth",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your upkeep, you may transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Transform Cloistered Youth?", effect: { kind: "transform", target: "source" } },
      resolve: null,
      text: "At the beginning of your upkeep, you may transform this creature.",
    },
  ],
  faces: ["Cloistered Youth", "Unholy Fiend"],
  transform: true,
});
