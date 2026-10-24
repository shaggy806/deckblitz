import { defineCard } from "../define.js";

// EDHREC rank 24012.
//
// An intervening-if (rule 603.4), checked as each end step begins and again
// as it resolves (the ruling). It looks for another colorless creature
// whatever this one's own colour is.
const TEXT =
  "At the beginning of each end step, if you control no other colorless creatures, return this creature to its owner's hand.";

export default defineCard({
  name: "Dust Stalker",
  manaCost: "{2}{B}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 3,
  keywords: ["haste"],
  text: `Devoid (This card has no color.)\nHaste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", colorless: true }, atLeast: 1, excludeSelf: true },
      },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
