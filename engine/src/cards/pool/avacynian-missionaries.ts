import { defineCard } from "../define.js";

const TEXT = "At the beginning of your end step, if this creature is equipped, transform it.";

// The Equipment stays attached as it transforms (the ruling): transforming
// doesn't change the object.
export default defineCard({
  name: "Avacynian Missionaries",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { equipped: true } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Avacynian Missionaries", "Lunarch Inquisitors"],
  transform: true,
});
