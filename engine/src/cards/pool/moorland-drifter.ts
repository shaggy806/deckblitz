import { defineCard } from "../define.js";

export default defineCard({
  name: "Moorland Drifter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "Delirium — This creature has flying as long as there are four or more card types among cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantKeywords: ["flying"],
      text: "Delirium — This creature has flying as long as there are four or more card types among cards in your graveyard.",
    },
  ],
});
