import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 27672. Drill-Skimmer's conditional shroud, on
// "no untapped lands" (`not` of controlling one).

export default defineCard({
  name: "Vintara Snapper",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 2,
  toughness: 2,
  text: "This creature has shroud as long as you control no untapped lands. (It can't be the target of spells or abilities.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      grantKeywords: ["shroud"],
      text: "This creature has shroud as long as you control no untapped lands.",
    },
  ],
});
