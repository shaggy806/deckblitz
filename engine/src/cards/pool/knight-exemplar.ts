import { defineCard } from "../define.js";

// Under a Wrath, only Exemplar dies: which permanents are indestructible is
// fixed before any of them leaves (`drainPendingDestruction`, its ruling).
export default defineCard({
  name: "Knight Exemplar",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)\nOther Knight creatures you control get +1/+1 and have indestructible. (Damage and effects that say \"destroy\" don't destroy them.)",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Knight" },
      grantPt: [1, 1],
      grantKeywords: ["indestructible"],
      text: "Other Knight creatures you control get +1/+1 and have indestructible.",
    },
  ],
});
