import { defineCard } from "../define.js";

// EDHREC rank 21935.
// Not targeted, and not optional: one artifact you control is chosen as it
// resolves — Esperzoa itself if it's the only one (the ruling).

const TEXT = "At the beginning of your upkeep, return an artifact you control to its owner's hand.";

export default defineCard({
  name: "Esperzoa",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Jellyfish"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "artifact", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return an artifact you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
