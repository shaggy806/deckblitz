import { defineCard } from "../define.js";

// Torment. EDHREC rank 29072.

const THRESHOLD_TEXT =
  'Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and has "When this creature becomes the target of a spell or ability, sacrifice it."';

export default defineCard({
  name: "Boneshard Slasher",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self" },
          targets: [],
          effect: { kind: "sacrifice-source" },
          resolve: null,
          text: "When this creature becomes the target of a spell or ability, sacrifice it.",
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
