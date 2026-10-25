import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 30054. Colossus of Sardia's upkeep window;
// "a creature" may be the Carriage itself.

const UNTAP_TEXT = "Sacrifice a creature: Untap this creature. Activate only during your upkeep.";

export default defineCard({
  name: "Black Carriage",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\nThis creature doesn't untap during your untap step.\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
