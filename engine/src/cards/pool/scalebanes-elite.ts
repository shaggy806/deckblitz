import { defineCard } from "../define.js";

export default defineCard({
  name: "Scalebane's Elite",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: "Protection from black",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
