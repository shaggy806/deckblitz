import { defineCard } from "../define.js";

// EDHREC rank 30566.
const DELIRIUM =
  "Delirium — This creature gets +1/+1 and has trample as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Backwoods Survivalists",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  text: DELIRIUM,
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
