import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 21753. Plague Engineer's static, over
// every player's creatures.

export default defineCard({
  name: "Engineered Plague",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: "As this enchantment enters, choose a creature type.\nAll creatures of the chosen type get -1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", ofChosenType: true } },
      grantPt: [-1, -1],
      text: "All creatures of the chosen type get -1/-1.",
    },
  ],
});
