import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 24551.
const UPKEEP_TEXT = "At the beginning of your upkeep, return a red creature you control to its owner's hand.";

export default defineCard({
  name: "Oni of Wild Places",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 6,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", colors: ["R"] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a red creature you control to its owner's hand",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
