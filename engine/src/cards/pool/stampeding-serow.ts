import { defineCard } from "../define.js";

// Saviors of Kamigawa. Stampeding Wildebeests' trigger: chosen on resolution,
// untargeted (its rulings), and itself when it's the only green creature.
const UPKEEP_TEXT = "At the beginning of your upkeep, return a green creature you control to its owner's hand.";

export default defineCard({
  name: "Stampeding Serow",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Antelope", "Beast"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", colors: ["G"], controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a green creature you control to its owner's hand",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
