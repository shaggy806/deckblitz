import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunlit Hoplite",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "During your turn, this creature has first strike.\nThis creature gets +1/+0 as long as you control an Elspeth planeswalker.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Elspeth" }, atLeast: 1 },
      grantPt: [1, 0],
      text: "This creature gets +1/+0 as long as you control an Elspeth planeswalker.",
    },
  ],
});
