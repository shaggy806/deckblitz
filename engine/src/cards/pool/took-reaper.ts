import { defineCard } from "../define.js";

export default defineCard({
  name: "Took Reaper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Halfling", "Peasant"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, the Ring tempts you.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When this creature dies, the Ring tempts you.",
    },
  ],
});
