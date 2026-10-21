import { defineCard } from "../define.js";

// Legends. EDHREC rank 31255.

export default defineCard({
  name: "Beasts of Bogardan",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: "Protection from red\nThis creature gets +1/+1 as long as an opponent controls a nontoken white permanent.",
  static: [
    { affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" },
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { colors: ["W"], token: false }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as an opponent controls a nontoken white permanent.",
    },
  ],
});
