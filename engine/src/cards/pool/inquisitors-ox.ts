import { defineCard } from "../define.js";

const TEXT =
  "Delirium — This creature gets +1/+0 and has vigilance as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Inquisitor's Ox",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 2,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [1, 0],
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
