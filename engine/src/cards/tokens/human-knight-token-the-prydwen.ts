import { defineCard } from "../define.js";

// The Prydwen, Steel Flagship's Human Knight token. "An artifact entered the
// battlefield under your control this turn" is the turn's history, not the
// board (the Prydwen ruling): one that has left since still counts.
const TEXT = "This token gets +2/+2 as long as an artifact entered the battlefield under your control this turn.";

export default defineCard({
  name: "Human Knight Token (The Prydwen)",
  art: "546bda77-e3a8-4f2a-ba9c-94fb0b9ff183",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      grantPt: [2, 2],
      text: TEXT,
    },
  ],
});
