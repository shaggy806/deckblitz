import { defineCard } from "../define.js";

// Alliances. EDHREC rank 30871.
//
// Rulings:
//   [2008-10-01] If Juniper Order Advocate somehow becomes green, its ability will affect itself.
//
// Sylvan Anthem's filter (which includes itself, the ruling) gated on the
// source being untapped (Archelos's `source` condition).

const TEXT = "As long as this creature is untapped, green creatures you control get +1/+1.";

export default defineCard({
  name: "Juniper Order Advocate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" } },
      condition: { kind: "source", filter: { tapped: false } },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
