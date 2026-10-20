import { defineCard } from "../define.js";

// EDHREC rank 28281.
const LANDS_TEXT = "As long as you control eight or more lands, this creature gets +1/+0 and can't be blocked.";
const eightLands = { kind: "controls", filter: { type: "land" }, atLeast: 8, countsSelf: true } as const;

export default defineCard({
  name: "Vortex Runner",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: LANDS_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: eightLands,
      grantPt: [1, 0],
      grantKeywords: ["unblockable"],
      text: LANDS_TEXT,
    },
  ],
});
