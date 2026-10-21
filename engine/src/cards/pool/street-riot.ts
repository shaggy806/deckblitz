import { defineCard } from "../define.js";

const TEXT = "During your turn, creatures you control get +1/+0 and have trample.";

export default defineCard({
  name: "Street Riot",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "your-turn" },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
