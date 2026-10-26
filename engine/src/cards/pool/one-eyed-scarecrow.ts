import { defineCard } from "../define.js";

const TEXT = "Creatures with flying your opponents control get -1/-0.";

export default defineCard({
  name: "One-Eyed Scarecrow",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", keyword: "flying", controlledBy: "opponent" } },
      grantPt: [-1, 0],
      text: TEXT,
    },
  ],
});
