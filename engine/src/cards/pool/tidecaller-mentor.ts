import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 13702.
// Threshold as an intervening "if" (rule 603.4): asked as it triggers and again as it
// resolves; the target is optional ("up to one").
const TEXT =
  "Threshold — When this creature enters, if there are seven or more cards in your graveyard, return up to one target nonland permanent to its owner's hand.";

export default defineCard({
  name: "Tidecaller Mentor",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Rat", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "threshold" },
      targets: [{ kind: "optional", of: "nonland-permanent" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
