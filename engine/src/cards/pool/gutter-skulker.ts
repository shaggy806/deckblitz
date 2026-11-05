import { defineCard } from "../define.js";

// "Attacking alone": it's attacking and no other creature is (rule 506.5) —
// Security Bypass's reading; only one player attacks at a time.

const ALONE_TEXT = "This creature can't be blocked as long as it's attacking alone.";

export default defineCard({
  name: "Gutter Skulker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${ALONE_TEXT}\nDisturb {3}{U} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attacking: true } },
          { kind: "not", of: { kind: "controls", filter: { attacking: true }, atLeast: 2 } },
        ],
      },
      restrictions: ["cant-be-blocked"],
      text: ALONE_TEXT,
    },
  ],
  faces: ["Gutter Skulker", "Gutter Shortcut"],
  transform: true,
  disturb: { cost: "{3}{U}" },
});
