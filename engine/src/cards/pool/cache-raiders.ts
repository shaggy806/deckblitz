import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 28246.
//
// Not targeted: the permanent is chosen as the ability resolves (the ruling),
// and this creature itself may be the one.

const TEXT = "At the beginning of your upkeep, return a permanent you control to its owner's hand.";

export default defineCard({
  name: "Cache Raiders",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a permanent you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
