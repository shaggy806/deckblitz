import { defineCard } from "../define.js";

// EDHREC rank 18119.

const PUMP_TEXT = "This creature gets +1/+0 as long as any player controls a white permanent.";

export default defineCard({
  name: "Knight of Malice",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike (This creature deals combat damage before creatures without first strike.)\nHexproof from white (This creature can't be the target of white spells or abilities your opponents control.)\n${PUMP_TEXT}`,
  static: [
    { affects: { scope: "self" }, hexproofFrom: { colors: ["W"] }, text: "Hexproof from white" },
    {
      // "Any player" is you (this creature included, should it turn white)
      // or some opponent.
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { colors: ["W"] }, atLeast: 1, countsSelf: true },
          { kind: "opponent-controls", filter: { colors: ["W"] }, atLeast: 1 },
        ],
      },
      grantPt: [1, 0],
      text: PUMP_TEXT,
    },
  ],
});
