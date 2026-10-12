import { defineCard } from "../define.js";

export default defineCard({
  name: "Ihsan's Shade",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shade", "Knight"],
  power: 5,
  toughness: 5,
  text: "Protection from white",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
