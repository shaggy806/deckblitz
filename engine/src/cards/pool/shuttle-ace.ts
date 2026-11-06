import { defineCard } from "../define.js";

export default defineCard({
  name: "Shuttle Ace",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kelpien", "Pilot"],
  power: 4,
  toughness: 4,
  text: "During your turn, this creature has flying.\nWhenever this creature becomes tapped, you gain 2 life.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: "During your turn, this creature has flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever this creature becomes tapped, you gain 2 life.",
    },
  ],
});
