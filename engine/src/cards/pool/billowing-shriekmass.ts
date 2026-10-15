import { defineCard } from "../define.js";

const THRESHOLD_TEXT =
  "Threshold — This creature gets +2/+1 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Billowing Shriekmass",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nWhen this creature enters, mill three cards. (Put the top three cards of your library into your graveyard.)\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: "When this creature enters, mill three cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 1],
      text: THRESHOLD_TEXT,
    },
  ],
});
