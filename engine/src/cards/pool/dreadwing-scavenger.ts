import { defineCard } from "../define.js";

// EDHREC rank 11030.

const LOOT_TEXT = "Whenever this creature enters or attacks, draw a card, then discard a card.";
const THRESHOLD_TEXT =
  "Threshold — This creature gets +1/+1 and has deathtouch as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Dreadwing Scavenger",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${LOOT_TEXT}\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantKeywords: ["deathtouch"],
      text: THRESHOLD_TEXT,
    },
  ],
});
