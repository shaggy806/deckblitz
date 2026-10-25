import { defineCard } from "../define.js";

// Growing Rites of Itlimoc's shape: an intervening-if on the upkeep trigger,
// checked as it triggers and again as it resolves (the rulings).
const TEXT = "At the beginning of your upkeep, if you control four or more creatures, transform this creature.";

export default defineCard({
  name: "Hanweir Militia Captain",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 4 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Hanweir Militia Captain", "Westvale Cult Leader"],
  transform: true,
});
