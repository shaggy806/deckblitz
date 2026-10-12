import { defineCard } from "../define.js";

export default defineCard({
  name: "Hookblade Veteran",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 2,
  text: "During your turn, this creature has flying. (It can't be blocked except by creatures with flying or reach.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: "During your turn, this creature has flying.",
    },
  ],
});
