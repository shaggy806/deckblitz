import { defineCard } from "../define.js";

// EDHREC rank 11900.
//
// "Other Dinosaurs you control" — any permanent of the type (a Kindred one
// too), so a filter scope rather than creatures only.

const LORD_TEXT =
  "Other Dinosaurs you control get +1/+1 and have hexproof. (They can't be the targets of spells or abilities your opponents control.)";

export default defineCard({
  name: "Devil Dinosaur",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${LORD_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you", subtype: "Dinosaur" }, excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["hexproof"],
      text: LORD_TEXT,
    },
  ],
});
