import { defineCard } from "../define.js";

const TEXT = "At the beginning of the end step, if you gained 3 or more life this turn, transform this creature.";

export default defineCard({
  name: "Lone Rider",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "lifelink"],
  text: `First strike, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Lone Rider", "It That Rides as One"],
  transform: true,
});
