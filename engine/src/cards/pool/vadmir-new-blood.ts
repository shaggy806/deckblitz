import { defineCard } from "../define.js";

// EDHREC rank 8670.
//
// Blood Hustler's crime trigger, and Voice of the Blessed's counter threshold.

const CRIME_TEXT =
  "Whenever you commit a crime, put a +1/+1 counter on Vadmir. This ability triggers only once each turn.";
const FOUR_TEXT = "As long as Vadmir has four or more +1/+1 counters on it, it has menace and lifelink.";

export default defineCard({
  name: "Vadmir, New Blood",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\n${FOUR_TEXT}`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 4 } },
      grantKeywords: ["menace", "lifelink"],
      text: FOUR_TEXT,
    },
  ],
});
