import { defineCard } from "../define.js";

export default defineCard({
  name: "Lancer Sliver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "Sliver creatures you control have first strike.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantKeywords: ["first-strike"],
      text: "Sliver creatures you control have first strike.",
    },
  ],
});
