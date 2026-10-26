import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 32242.
//
// Rulings:
//   [2004-10-04] In a multiplayer game, it gets the bonus if at least one opponent controls a
//   black permanent.

export default defineCard({
  name: "Radiant Essence",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: "This creature gets +1/+2 as long as an opponent controls a black permanent.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { colors: ["B"] }, atLeast: 1 },
      grantPt: [1, 2],
      text: "This creature gets +1/+2 as long as an opponent controls a black permanent.",
    },
  ],
});
