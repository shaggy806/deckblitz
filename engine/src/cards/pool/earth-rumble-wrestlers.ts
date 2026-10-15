import { defineCard } from "../define.js";

// EDHREC rank 19887. Bristlebane Outrider's "entered the battlefield under
// your control this turn", or'd with a land creature you control.

const PUMP_TEXT =
  "This creature gets +1/+0 and has trample as long as you control a land creature or a land entered the battlefield under your control this turn.";

export default defineCard({
  name: "Earth Rumble Wrestlers",
  manaCost: "{3}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Performer"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { types: ["land", "creature"] }, atLeast: 1 },
          { kind: "turn-history", what: "entered", filter: { type: "land" } },
        ],
      },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: PUMP_TEXT,
    },
  ],
});
