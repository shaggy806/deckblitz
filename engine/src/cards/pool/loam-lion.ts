import { defineCard } from "../define.js";

// EDHREC rank 16155. Kird Ape's shape.
//
// Rulings:
//   [2010-03-01] Loam Lion either gets +1/+2 or it doesn’t. It doesn’t get the bonus for each
//     Forest you control.

const TEXT = "This creature gets +1/+2 as long as you control a Forest.";

export default defineCard({
  name: "Loam Lion",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
      grantPt: [1, 2],
      text: TEXT,
    },
  ],
});
