import { defineCard } from "../define.js";

export default defineCard({
  name: "Daggersail Aeronaut",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 2,
  text: "During your turn, this creature has flying.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: "During your turn, this creature has flying.",
    },
  ],
});
