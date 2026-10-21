import { defineCard } from "../define.js";

export default defineCard({
  name: "Knight of Grace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)\nHexproof from black (This creature can't be the target of black spells or abilities your opponents control.)\nThis creature gets +1/+0 as long as any player controls a black permanent.",
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { colors: ["B"] },
      text: "Hexproof from black",
    },
    {
      affects: { scope: "self" },
      // Any player: you (this creature included, should it turn black) or an
      // opponent.
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { colors: ["B"] }, atLeast: 1, countsSelf: true },
          { kind: "opponent-controls", filter: { colors: ["B"] }, atLeast: 1 },
        ],
      },
      grantPt: [1, 0],
      text: "This creature gets +1/+0 as long as any player controls a black permanent.",
    },
  ],
});
