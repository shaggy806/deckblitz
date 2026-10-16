import { defineCard } from "../define.js";

// EDHREC rank 15578.
const DELIRIUM =
  "Delirium — This creature gets +1/+1 and has trample as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Wildfire Wickerfolk",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${DELIRIUM}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: DELIRIUM,
    },
  ],
});
