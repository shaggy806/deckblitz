import { defineCard } from "../define.js";

// EDHREC rank 28039.

export default defineCard({
  name: "Dapper Shieldmate",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "This creature enters with a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\nDuring your turn, this creature gets +2/+0.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "This creature enters with a shield counter on it.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantPt: [2, 0],
      text: "During your turn, this creature gets +2/+0.",
    },
  ],
});
