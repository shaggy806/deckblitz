import { defineCard } from "../define.js";

// EDHREC rank 27821. Azorius Skyguard's anthem, narrowed to fliers.

export default defineCard({
  name: "Smog Elemental",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nCreatures with flying your opponents control get -1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", keyword: "flying", controlledBy: "opponent" } },
      grantPt: [-1, -1],
      text: "Creatures with flying your opponents control get -1/-1.",
    },
  ],
});
