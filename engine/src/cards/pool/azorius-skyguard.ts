import { defineCard } from "../define.js";

export default defineCard({
  name: "Azorius Skyguard",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  text: "Flying, first strike\nCreatures your opponents control get -1/-0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      grantPt: [-1, 0],
      text: "Creatures your opponents control get -1/-0.",
    },
  ],
});
