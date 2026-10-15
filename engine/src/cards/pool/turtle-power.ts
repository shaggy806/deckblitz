import { defineCard } from "../define.js";

// EDHREC rank 18831.

export default defineCard({
  name: "Turtle Power!",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: "Flash\nTurtles you control get +2/+2.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Turtle" },
      grantPt: [2, 2],
      text: "Turtles you control get +2/+2.",
    },
  ],
});
