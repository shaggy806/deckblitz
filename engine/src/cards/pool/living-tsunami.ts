import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 29741. Vapor Snare's upkeep: with a land to
// return you may return one, and the creature is sacrificed if you don't —
// or can't, with no land.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you return a land you control to its owner's hand.";

export default defineCard({
  name: "Living Tsunami",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Return a land you control to its owner's hand? If you don't, sacrifice Living Tsunami.",
          effect: {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            min: 1,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return a land you control to its owner's hand",
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
