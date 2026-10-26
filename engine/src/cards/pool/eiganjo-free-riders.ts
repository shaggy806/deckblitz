import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, return a white creature you control to its owner's hand.";

export default defineCard({
  name: "Eiganjo Free-Riders",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", colors: ["W"] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a white creature you control to its owner's hand",
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
