import { defineCard } from "../define.js";

// EDHREC rank 29545.

export default defineCard({
  name: "Prickleboar",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 3,
  toughness: 3,
  text: "During your turn, this creature gets +2/+0 and has first strike. (It deals combat damage before creatures without first strike.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantPt: [2, 0],
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature gets +2/+0 and has first strike.",
    },
  ],
});
