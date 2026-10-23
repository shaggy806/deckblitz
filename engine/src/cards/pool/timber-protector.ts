import { defineCard } from "../define.js";

// EDHREC rank 7897.
//
// Rulings:
//   If Timber Protector somehow becomes a Forest, it doesn't give itself indestructible.

export default defineCard({
  name: "Timber Protector",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 4,
  toughness: 6,
  text: "Other Treefolk creatures you control get +1/+1.\nOther Treefolk and Forests you control have indestructible.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Treefolk" },
      grantPt: [1, 1],
      text: "Other Treefolk creatures you control get +1/+1.",
    },
    {
      affects: {
        scope: "filter",
        filter: { controlledBy: "you", anyOf: [{ subtype: "Treefolk" }, { subtype: "Forest" }] },
        excludeSelf: true,
      },
      grantKeywords: ["indestructible"],
      text: "Other Treefolk and Forests you control have indestructible.",
    },
  ],
});
