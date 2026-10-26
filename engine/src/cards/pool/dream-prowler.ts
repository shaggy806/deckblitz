import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 30426.
//
// Yuan-Ti Malison's shape: "attacking alone" (rule 506.5) is attacking with
// no other attacking creature, and only the active player's creatures attack.

const TEXT = "This creature can't be blocked as long as it's attacking alone.";

export default defineCard({
  name: "Dream Prowler",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attacking: true } },
          { kind: "not", of: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 1 } },
        ],
      },
      grantKeywords: ["unblockable"],
      text: TEXT,
    },
  ],
});
