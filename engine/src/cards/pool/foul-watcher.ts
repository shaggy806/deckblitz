import { defineCard } from "../define.js";

export default defineCard({
  name: "Foul Watcher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, surveil 1. (Look at the top card of your library. You may put that card into your graveyard.)\nDelirium — This creature gets +1/+0 as long as there are four or more card types among cards in your graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "When this creature enters, surveil 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [1, 0],
      text: "Delirium — This creature gets +1/+0 as long as there are four or more card types among cards in your graveyard.",
    },
  ],
});
