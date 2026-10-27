import { defineCard } from "../define.js";

// EDHREC rank 24497.

const REGEN_TEXT = "{B}, Discard a card: Regenerate this creature.";
const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and can't block.";

export default defineCard({
  name: "Dirty Wererat",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rat", "Minion"],
  power: 2,
  toughness: 3,
  text: `${REGEN_TEXT}\n${THRESHOLD_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      restrictions: ["cant-block"],
      text: THRESHOLD_TEXT,
    },
  ],
});
