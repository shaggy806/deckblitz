import { defineCard } from "../define.js";

export default defineCard({
  name: "Rin and Seri, Inseparabler",
  manaCost: "{R/G}{G/W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog", "Cat", "Scientist"],
  power: 3,
  toughness: 2,
  text: "All Cats you control are Dogs in addition to their other types.\nAll Dogs you control are Cats in addition to their other types.\nCats and Dogs you control have haste.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Cat", controlledBy: "you" } },
      addSubtypes: ["Dog"],
      text: "All Cats you control are Dogs in addition to their other types.",
    },
    {
      affects: { scope: "filter", filter: { subtype: "Dog", controlledBy: "you" } },
      addSubtypes: ["Cat"],
      text: "All Dogs you control are Cats in addition to their other types.",
    },
    {
      affects: { scope: "filter", filter: { subtypes: ["Cat", "Dog"], controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: "Cats and Dogs you control have haste.",
    },
  ],
});
