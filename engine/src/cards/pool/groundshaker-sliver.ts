import { defineCard } from "../define.js";

export default defineCard({
  name: "Groundshaker Sliver",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 5,
  toughness: 5,
  text: "Sliver creatures you control have trample. (A creature with trample can deal excess combat damage to the player or planeswalker it's attacking.)",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantKeywords: ["trample"],
      text: "Sliver creatures you control have trample.",
    },
  ],
});
