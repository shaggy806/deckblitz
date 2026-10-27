import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 30175.
//
// Rulings:
//   [2004-10-04] When you have seven or more cards in your graveyard, this card is black. It is
//     not white and black.
//
// Possessed Aven's threshold shape (`setColors` makes it black only), with
// Inevitable End's granted upkeep trigger.

const UPKEEP = "At the beginning of your upkeep, sacrifice a creature.";
const TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +3/+3, is black, has trample, and has "${UPKEEP}"`;

export default defineCard({
  name: "Wayward Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [3, 3],
      setColors: ["B"],
      grantKeywords: ["trample"],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
          resolve: null,
          text: UPKEEP,
        },
      ],
      text: TEXT,
    },
  ],
});
