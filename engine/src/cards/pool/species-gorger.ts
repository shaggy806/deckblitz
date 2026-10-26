import { defineCard } from "../define.js";

// Esperzoa's shape over creatures: not targeted, chosen as it resolves, and
// Species Gorger itself may be the one returned.
const TEXT = "At the beginning of your upkeep, return a creature you control to its owner's hand.";

export default defineCard({
  name: "Species Gorger",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a creature you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
